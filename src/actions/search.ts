"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { persons, cellGroups } from "@/lib/db/schema";
import { eq, and, ilike, asc } from "drizzle-orm";
import { getAuthUserContext } from "@/lib/auth-context";
import { toActionError, logActionError } from "@/lib/actions/result";
import type { ActionResult } from "@/lib/actions/result";

const SearchSchema = z.string().min(2).max(100);

export type SearchResult = {
  members: { id: string; fullName: string }[];
  cells: { id: string; name: string }[];
};

export async function globalSearch(
  query: string
): Promise<ActionResult<SearchResult>> {
  try {
    const parsed = SearchSchema.safeParse(query);
    if (!parsed.success) {
      return { data: null, error: "Termo de busca deve ter entre 2 e 100 caracteres." };
    }

    const { dbUser } = await getAuthUserContext();
    const term = `%${parsed.data}%`;

    const [members, cells] = await Promise.all([
      db
        .select({ id: persons.id, fullName: persons.fullName })
        .from(persons)
        .where(and(eq(persons.churchId, dbUser.churchId), ilike(persons.fullName, term)))
        .orderBy(asc(persons.fullName))
        .limit(3),
      db
        .select({ id: cellGroups.id, name: cellGroups.name })
        .from(cellGroups)
        .where(and(eq(cellGroups.churchId, dbUser.churchId), ilike(cellGroups.name, term)))
        .orderBy(asc(cellGroups.name))
        .limit(3),
    ]);

    return { data: { members, cells }, error: null };
  } catch (err) {
    logActionError("globalSearch", err, { query });
    return { data: null, error: toActionError(err, "Não foi possível buscar. Tente novamente.") };
  }
}
