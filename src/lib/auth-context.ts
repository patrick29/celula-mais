import { cache } from "react";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { userError } from "@/lib/actions/result";
import { eq } from "drizzle-orm";

export type UserRole = "ADMIN" | "PASTOR" | "SUPERVISOR" | "LEADER" | "ASSISTANT";

/**
 * Deduplicated auth context fetcher using React's cache().
 * Prevents redundant database and Supabase Auth calls within the same request lifecycle.
 */
export const getAuthUserContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    userError("Sua sessão expirou. Entre novamente para continuar.");
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser) {
    userError("Sua conta não foi encontrada. Fale com o administrador.");
  }

  if (!dbUser.isActive) {
    await supabase.auth.signOut();
    userError("Sua conta está desativada. Fale com o administrador.");
  }

  return { authUser, dbUser };
});

export async function requireRole(allowed: UserRole[]) {
  const ctx = await getAuthUserContext();
  if (!allowed.includes(ctx.dbUser.role as UserRole)) {
    userError("Você não tem permissão para acessar esta área.");
  }
  return ctx;
}
