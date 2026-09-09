import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run migrations.");
}

const url = new URL(connectionString);

// pg treats Prisma's "system" value as a file path. Use Node's trusted CAs instead.
if (url.searchParams.get("sslrootcert") === "system") {
  url.searchParams.delete("sslrootcert");
}

const pool = new pg.Pool({
  connectionString: url.toString(),
  max: 1,
  connectionTimeoutMillis: 10_000,
});

try {
  console.log("Applying database migrations...");
  await migrate(drizzle(pool), {
    migrationsFolder: fileURLToPath(new URL("./drizzle", import.meta.url)),
    migrationsTable: "__drizzle_migrations",
    migrationsSchema: "drizzle",
  });
  console.log("Database migrations completed.");
} catch (error) {
  console.error("Database migration failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
