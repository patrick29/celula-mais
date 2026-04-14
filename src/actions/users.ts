"use server";

import { revalidatePath } from "next/cache";
import { alias } from "drizzle-orm/pg-core";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth-context";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  toActionError,
  userError,
  logActionError,
  type ActionResult,
} from "@/lib/actions/result";
import {
  createUserSchema,
  updateUserSchema,
  listUsersSchema,
  setUserActiveSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type ListUsersInput,
} from "@/app/(dashboard)/settings/usuarios/schemas";
import { requestPasswordReset } from "@/actions/auth";

export type UserListItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: (typeof users.$inferSelect)["role"];
  supervisorId: string | null;
  supervisorName: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export async function listUsers(
  params: ListUsersInput = { status: "all" }
): Promise<ActionResult<UserListItem[]>> {
  try {
    const { dbUser } = await requireRole(["ADMIN"]);
    const parsed = listUsersSchema.parse(params);

    const supervisors = alias(users, "supervisors");
    const conditions = [eq(users.churchId, dbUser.churchId)];

    if (parsed.search && parsed.search.trim()) {
      const term = `%${parsed.search.trim()}%`;
      conditions.push(
        or(ilike(users.fullName, term), ilike(users.email, term))!
      );
    }

    if (parsed.role) {
      conditions.push(eq(users.role, parsed.role));
    }

    if (parsed.status === "active") {
      conditions.push(eq(users.isActive, true));
    } else if (parsed.status === "inactive") {
      conditions.push(eq(users.isActive, false));
    }

    const rows = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        role: users.role,
        supervisorId: users.supervisorId,
        supervisorName: supervisors.fullName,
        isActive: users.isActive,
        mustChangePassword: users.mustChangePassword,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(supervisors, eq(users.supervisorId, supervisors.id))
      .where(and(...conditions))
      .orderBy(asc(users.fullName));

    return { data: rows, error: null };
  } catch (err) {
    logActionError("listUsers", err, { params });
    return {
      data: null,
      error: toActionError(err, "Não foi possível carregar a lista de usuários."),
    };
  }
}

export async function createUser(
  input: CreateUserInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = createUserSchema.parse(input);
  let createdAuthUserId: string | null = null;
  try {
    const { dbUser: currentUser } = await requireRole(["ADMIN"]);

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.email))
      .limit(1);
    if (existing) {
      userError("Este email já está cadastrado.");
    }

    const admin = createAdminClient();
    const { data: createdAuth, error: createAuthError } =
      await admin.auth.admin.createUser({
        email: parsed.email,
        password: parsed.initialPassword,
        email_confirm: true,
      });

    if (createAuthError || !createdAuth.user) {
      logActionError("createUser.admin.createUser", createAuthError);
      userError("Não foi possível criar o acesso. Verifique o email e tente novamente.");
    }

    createdAuthUserId = createdAuth.user.id;

    const [inserted] = await db
      .insert(users)
      .values({
        id: createdAuthUserId,
        fullName: parsed.fullName,
        email: parsed.email,
        phone: parsed.phone ?? null,
        role: parsed.role,
        churchId: currentUser.churchId,
        supervisorId: parsed.supervisorId ?? null,
        isActive: true,
        mustChangePassword: parsed.mustChangePassword,
      })
      .returning({ id: users.id });

    revalidatePath("/settings/usuarios");
    return { data: { id: inserted.id }, error: null };
  } catch (err) {
    logActionError("createUser", err, { email: parsed.email });
    if (createdAuthUserId) {
      try {
        const admin = createAdminClient();
        await admin.auth.admin.deleteUser(createdAuthUserId);
      } catch (cleanupErr) {
        logActionError("createUser.rollback", cleanupErr, {
          authUserId: createdAuthUserId,
        });
      }
    }
    return {
      data: null,
      error: toActionError(err, "Não foi possível cadastrar o usuário. Tente novamente."),
    };
  }
}

export async function updateUser(
  input: UpdateUserInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUser: currentUser } = await requireRole(["ADMIN"]);
    const parsed = updateUserSchema.parse(input);

    const [updated] = await db
      .update(users)
      .set({
        fullName: parsed.fullName,
        phone: parsed.phone ?? null,
        role: parsed.role,
        supervisorId: parsed.supervisorId ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(eq(users.id, parsed.id), eq(users.churchId, currentUser.churchId))
      )
      .returning({ id: users.id });

    if (!updated) {
      userError("Este usuário não está mais disponível ou você não tem permissão.");
    }

    revalidatePath("/settings/usuarios");
    return { data: { id: updated.id }, error: null };
  } catch (err) {
    logActionError("updateUser", err, { id: input?.id });
    return {
      data: null,
      error: toActionError(err, "Não foi possível atualizar o usuário. Tente novamente."),
    };
  }
}

export async function setUserActive(
  input: { id: string; isActive: boolean }
): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUser: currentUser } = await requireRole(["ADMIN"]);
    const parsed = setUserActiveSchema.parse(input);

    if (parsed.id === currentUser.id) {
      userError("Você não pode desativar a si mesmo.");
    }

    const [updated] = await db
      .update(users)
      .set({ isActive: parsed.isActive, updatedAt: new Date() })
      .where(
        and(eq(users.id, parsed.id), eq(users.churchId, currentUser.churchId))
      )
      .returning({ id: users.id });

    if (!updated) {
      userError("Este usuário não está mais disponível.");
    }

    if (!parsed.isActive) {
      try {
        const admin = createAdminClient();
        await admin.auth.admin.updateUserById(parsed.id, {
          ban_duration: "876000h",
        });
      } catch (banErr) {
        logActionError("setUserActive.ban", banErr, { id: parsed.id });
      }
    } else {
      try {
        const admin = createAdminClient();
        await admin.auth.admin.updateUserById(parsed.id, { ban_duration: "none" });
      } catch (unbanErr) {
        logActionError("setUserActive.unban", unbanErr, { id: parsed.id });
      }
    }

    revalidatePath("/settings/usuarios");
    return { data: { id: updated.id }, error: null };
  } catch (err) {
    logActionError("setUserActive", err, { id: input?.id });
    return {
      data: null,
      error: toActionError(err, "Não foi possível alterar o status do usuário. Tente novamente."),
    };
  }
}

export async function resendPasswordResetForUser(
  userId: string
): Promise<ActionResult<{ sent: true }>> {
  try {
    await requireRole(["ADMIN"]);
    const [target] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!target) {
      userError("Este usuário não está mais disponível.");
    }
    return await requestPasswordReset({ email: target.email });
  } catch (err) {
    logActionError("resendPasswordResetForUser", err, { userId });
    return {
      data: null,
      error: toActionError(err, "Não foi possível enviar o link. Tente novamente."),
    };
  }
}

export async function getSupervisorOptions(): Promise<
  ActionResult<{ id: string; fullName: string; role: string }[]>
> {
  try {
    const { dbUser } = await requireRole(["ADMIN"]);
    const rows = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        role: users.role,
      })
      .from(users)
      .where(
        and(
          eq(users.churchId, dbUser.churchId),
          eq(users.isActive, true),
          sql`${users.role} IN ('ADMIN','PASTOR','SUPERVISOR')`
        )
      )
      .orderBy(asc(users.fullName));
    return { data: rows, error: null };
  } catch (err) {
    logActionError("getSupervisorOptions", err);
    return { data: null, error: toActionError(err, "Não foi possível carregar supervisores.") };
  }
}
