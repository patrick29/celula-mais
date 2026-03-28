import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./src/lib/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL!;
const queryClient = postgres(connectionString);
const db = drizzle(queryClient, { schema });

async function seed() {
  console.log("Seeding default church and user...");

  // Insert church
  const [church] = await db
    .insert(schema.churches)
    .values({
      name: "Igreja Local de Teste",
      city: "São Paulo",
      state: "SP",
    })
    .returning();

  console.log("Church created:", church.id);

  // Insert user
  const [user] = await db
    .insert(schema.users)
    .values({
      fullName: "Administrador de Teste",
      email: "admin@teste.com",
      passwordHash: "hash_falso",
      role: "ADMIN",
      churchId: church.id,
    })
    .returning();

  console.log("User created:", user.id);

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
