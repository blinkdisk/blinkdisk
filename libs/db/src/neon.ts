import { Kysely } from "kysely";

import { NeonDialect } from "kysely-neon";
import { DB as Schema } from "./schema";

export const database = () =>
  new Kysely<Schema>({
    dialect: new NeonDialect({
      connectionString: process.env.DATABASE_URL,
    }),
  });

export type Database = Kysely<Schema>;
export type DB = Schema;
