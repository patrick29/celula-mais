import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function runMigration() {
  console.log("⏳ Running migrations...");
  
  try {
    await migrate(db, { migrationsFolder: "src/lib/db/migrations" });
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();
