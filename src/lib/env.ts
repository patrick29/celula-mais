import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => i.path.join("."))
      .join(", ");
    throw new Error(
      `Variáveis de ambiente inválidas ou ausentes: ${missing}. Verifique seu .env.local.`
    );
  }
  cached = parsed.data;
  return cached;
}
