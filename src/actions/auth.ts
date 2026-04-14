"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/env";
import {
  toActionError,
  userError,
  logActionError,
  type ActionResult,
} from "@/lib/actions/result";

const passwordSchema = z
  .string()
  .min(8, "A senha precisa ter ao menos 8 caracteres.")
  .regex(/[a-zA-Z]/, "A senha precisa ter ao menos 1 letra.")
  .regex(/[0-9]/, "A senha precisa ter ao menos 1 número.");

const signInSchema = z.object({
  email: z.string().email("Informe um email válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export type SignInResult = ActionResult<{ mustChangePassword: boolean }>;

export async function signIn(input: z.infer<typeof signInSchema>): Promise<SignInResult> {
  try {
    const parsed = signInSchema.parse(input);
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.email,
      password: parsed.password,
    });

    if (error || !data.user) {
      return { data: null, error: "Email ou senha inválidos." };
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, data.user.id))
      .limit(1);

    if (!dbUser) {
      await supabase.auth.signOut();
      return {
        data: null,
        error: "Sua conta não foi encontrada no sistema. Fale com o administrador.",
      };
    }

    if (!dbUser.isActive) {
      await supabase.auth.signOut();
      return {
        data: null,
        error: "Sua conta está desativada. Fale com o administrador.",
      };
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, dbUser.id));

    return {
      data: { mustChangePassword: dbUser.mustChangePassword },
      error: null,
    };
  } catch (err) {
    logActionError("signIn", err, { email: input?.email });
    return {
      data: null,
      error: toActionError(err, "Não foi possível entrar. Tente novamente em instantes."),
    };
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

const requestResetSchema = z.object({
  email: z.string().email("Informe um email válido."),
});

export async function requestPasswordReset(
  input: z.infer<typeof requestResetSchema>
): Promise<ActionResult<{ sent: true }>> {
  try {
    const parsed = requestResetSchema.parse(input);
    const supabase = await createClient();
    const env = getServerEnv();

    const { error } = await supabase.auth.resetPasswordForEmail(parsed.email, {
      redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/login/redefinir-senha`,
    });

    if (error) {
      // Log but do not reveal to user — always return generic success for enumeration protection.
      logActionError("requestPasswordReset", error, { email: parsed.email });
    }

    return { data: { sent: true }, error: null };
  } catch (err) {
    logActionError("requestPasswordReset", err);
    // Still return generic success — never tell the caller if the email existed.
    return { data: { sent: true }, error: null };
  }
}

const updatePasswordSchema = z.object({
  password: passwordSchema,
});

export async function updatePasswordWithToken(
  input: z.infer<typeof updatePasswordSchema>
): Promise<ActionResult<{ ok: true }>> {
  try {
    const parsed = updatePasswordSchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      userError("Sua sessão de recuperação expirou. Solicite um novo link.");
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.password });
    if (error) {
      logActionError("updatePasswordWithToken.update", error, { userId: authUser.id });
      userError("Não foi possível atualizar sua senha. Solicite um novo link.");
    }

    await db
      .update(users)
      .set({ mustChangePassword: false })
      .where(eq(users.id, authUser.id));

    await supabase.auth.signOut();

    return { data: { ok: true }, error: null };
  } catch (err) {
    logActionError("updatePasswordWithToken", err);
    return {
      data: null,
      error: toActionError(err, "Não foi possível atualizar sua senha. Tente novamente."),
    };
  }
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual."),
  newPassword: passwordSchema,
});

export async function changeOwnPassword(
  input: z.infer<typeof changePasswordSchema>
): Promise<ActionResult<{ ok: true }>> {
  try {
    const parsed = changePasswordSchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser?.email) {
      userError("Sua sessão expirou. Entre novamente para continuar.");
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password: parsed.currentPassword,
    });
    if (verifyError) {
      userError("Senha atual incorreta.");
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.newPassword,
    });
    if (updateError) {
      logActionError("changeOwnPassword.update", updateError, { userId: authUser.id });
      userError("Não foi possível atualizar sua senha. Tente novamente.");
    }

    await db
      .update(users)
      .set({ mustChangePassword: false })
      .where(eq(users.id, authUser.id));

    return { data: { ok: true }, error: null };
  } catch (err) {
    logActionError("changeOwnPassword", err);
    return {
      data: null,
      error: toActionError(err, "Não foi possível atualizar sua senha. Tente novamente."),
    };
  }
}
