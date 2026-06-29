import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "./schema";

export const database = (databaseUrl: string) => {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
  });

  return drizzle({ client: pool, schema });
};

export type Database = NodePgDatabase<typeof schema>;
