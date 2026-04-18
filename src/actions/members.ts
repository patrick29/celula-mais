"use server";

import { db } from "@/lib/db";
import { persons, users, churchLifeEvents } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, ilike, desc, asc, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthUserContext } from "@/lib/auth-context";
import { toActionError, userError, logActionError } from "@/lib/actions/result";

/** Converts any empty string values in an object to null (for optional DB date/text fields). */
function nullify<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])
  ) as T;
}


// =========================================
// SELECT OPTIONS
// =========================================

export async function getPersonsForSelect(excludeId?: string) {
  try {
    const { dbUser } = await getAuthUserContext();

    const allPersons = await db
      .select({ id: persons.id, fullName: persons.fullName })
      .from(persons)
      .where(
        excludeId
          ? and(eq(persons.churchId, dbUser.churchId), ne(persons.id, excludeId))
          : eq(persons.churchId, dbUser.churchId)
      )
      .orderBy(persons.fullName);

    return { data: allPersons, error: null };
  } catch (err) {
    logActionError("getPersonsForSelect", err, { excludeId });
    return { data: null, error: toActionError(err, "Não foi possível carregar a lista de pessoas.") };
  }
}

// =========================================
// QUERIES
// =========================================

export type GetMembersParams = {
  search?: string;
};

export async function getMembers(params?: GetMembersParams) {
  try {
    const { dbUser } = await getAuthUserContext();

    const conditions = [eq(persons.churchId, dbUser.churchId)];
    if (params?.search) {
      conditions.push(ilike(persons.fullName, `%${params.search}%`));
    }

    const membersList = await db.query.persons.findMany({
      where: and(...conditions),
      orderBy: [asc(persons.fullName)],
      with: {
        churchLifeEvents: {
          orderBy: (events, { desc }) => [desc(events.date)],
        },
        spouse: true,
      },
    });

    return { data: membersList, error: null };
  } catch (err) {
    logActionError("getMembers", err, { params });
    return { data: null, error: toActionError(err, "Não foi possível carregar a lista de membros.") };
  }
}

export async function getMemberById(id: string) {
  try {
    const { dbUser } = await getAuthUserContext();

    const member = await db.query.persons.findFirst({
      where: and(eq(persons.id, id), eq(persons.churchId, dbUser.churchId)),
      with: {
        churchLifeEvents: {
          orderBy: (events, { desc }) => [desc(events.date)],
        },
        spouse: true,
      },
    });

    if (!member) return { data: null, error: "Este membro não está mais disponível." };

    return { data: member, error: null };
  } catch (err) {
    logActionError("getMemberById", err, { id });
    return { data: null, error: toActionError(err, "Não foi possível carregar os dados do membro.") };
  }
}

// =========================================
// MUTATIONS
// =========================================

export async function createMember(
  data: typeof persons.$inferInsert & {
    churchLifeEvents?: any[];
    spouseQuickName?: string;
    spouseAttends?: boolean;
  }
) {
  try {
    const { dbUser } = await getAuthUserContext();
    const { churchLifeEvents: events, spouseQuickName, spouseAttends, ...personData } = data as any;

    // Se informou um nome de cônjuge não cadastrado, cria primeiro
    let resolvedSpouseId = personData.spouseId || null;
    if (!resolvedSpouseId && spouseQuickName?.trim()) {
      const [newSpouse] = await db
        .insert(persons)
        .values(
          nullify({
            fullName: spouseQuickName.trim(),
            churchId: dbUser.churchId,
            attendsChurch: spouseAttends === false ? false : true,
          })
        )
        .returning({ id: persons.id });
      resolvedSpouseId = newSpouse.id;
    }

    const insertData = nullify({
      ...personData,
      churchId: dbUser.churchId,
      spouseId: resolvedSpouseId,
    });

    const [newMember] = await db.insert(persons).values(insertData).returning();

    // Atualiza o cônjuge para apontar de volta (vínculo bidirecional)
    if (resolvedSpouseId) {
      await db
        .update(persons)
        .set({ spouseId: newMember.id })
        .where(eq(persons.id, resolvedSpouseId));
    }

    if (events && events.length > 0) {
      const eventsData = events.map((evt: any) => ({
        personId: newMember.id,
        type: evt.type,
        date: evt.date,
        notes: evt.notes || null,
      }));
      await db.insert(churchLifeEvents).values(eventsData);
    }

    revalidatePath("/members");
    return { data: newMember, error: null };
  } catch (err) {
    logActionError("createMember", err);
    return { data: null, error: toActionError(err, "Não foi possível cadastrar o membro. Tente novamente.") };
  }
}

export async function updateMember(
  id: string,
  data: Partial<typeof persons.$inferInsert> & {
    churchLifeEvents?: any[];
    spouseQuickName?: string;
    spouseAttends?: boolean;
  }
) {
  try {
    const { dbUser } = await getAuthUserContext();
    const { churchId, churchLifeEvents: events, spouseQuickName, spouseAttends, ...updateData } = data as any;

    // Se informou nome de cônjuge não cadastrado, cria antes
    let resolvedSpouseId = updateData.spouseId !== undefined ? updateData.spouseId : undefined;
    if (!resolvedSpouseId && spouseQuickName?.trim()) {
      const [newSpouse] = await db
        .insert(persons)
        .values(
          nullify({
            fullName: spouseQuickName.trim(),
            churchId: dbUser.churchId,
            attendsChurch: spouseAttends === false ? false : true,
          })
        )
        .returning({ id: persons.id });
      resolvedSpouseId = newSpouse.id;
    }

    const [updatedMember] = await db
      .update(persons)
      .set(nullify({ ...updateData, spouseId: resolvedSpouseId ?? null }))
      .where(and(eq(persons.id, id), eq(persons.churchId, dbUser.churchId)))
      .returning();

    if (!updatedMember) userError("Este membro não está mais disponível ou você não tem permissão.");

    // Vínculo bidirecional
    if (resolvedSpouseId) {
      await db
        .update(persons)
        .set({ spouseId: id })
        .where(eq(persons.id, resolvedSpouseId));
    }

    if (events !== undefined) {
      await db.delete(churchLifeEvents).where(eq(churchLifeEvents.personId, id));
      if (events.length > 0) {
        const eventsData = events.map((evt: any) => ({
          personId: id,
          type: evt.type,
          date: evt.date,
          notes: evt.notes || null,
        }));
        await db.insert(churchLifeEvents).values(eventsData);
      }
    }

    revalidatePath("/members");
    return { data: updatedMember, error: null };
  } catch (err) {
    logActionError("updateMember", err, { id });
    return { data: null, error: toActionError(err, "Não foi possível atualizar o membro. Tente novamente.") };
  }
}

export async function deleteMember(id: string) {
  try {
    const { dbUser } = await getAuthUserContext();

    const [deletedMember] = await db
      .delete(persons)
      .where(and(eq(persons.id, id), eq(persons.churchId, dbUser.churchId)))
      .returning();

    if (!deletedMember) userError("Este membro não está mais disponível ou você não tem permissão.");

    revalidatePath("/members");
    return { data: deletedMember, error: null };
  } catch (err) {
    logActionError("deleteMember", err, { id });
    return { data: null, error: toActionError(err, "Não foi possível excluir o membro. Tente novamente.") };
  }
}
