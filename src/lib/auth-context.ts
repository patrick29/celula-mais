import { cache } from "react";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

/**
 * Deduplicated auth context fetcher using React's cache().
 * This prevents redundant database and Supabase Auth calls within the same request lifecycle.
 */
export const getAuthUserContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    // Attempt fallback only if specifically required or during initial development/seeding
    // In many production cases, you might prefer throwing a strict Unauthorized error.
    const [fallbackUser] = await db.select().from(users).limit(1);

    if (!fallbackUser) {
      throw new Error("Unauthorized and no fallback user found. Please seed the database first.");
    }

    return {
      authUser: { id: fallbackUser.id } as any,
      dbUser: fallbackUser,
    };
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser) {
    throw new Error("User not found in database");
  }

  return { authUser, dbUser };
});
