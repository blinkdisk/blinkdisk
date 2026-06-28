import type { DB as Schema } from "@db/schema";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

export const dialect = (databaseUrl: string) =>
  new PostgresDialect({
    pool: new Pool({
      connectionString: databaseUrl,
      max: 1,
    }),
  });

export const database = (databaseUrl: string) => {
  return new Kysely<Schema>({
    dialect: dialect(databaseUrl),
  });
};

export type Database = Kysely<Schema>;
export type DB = Schema;
