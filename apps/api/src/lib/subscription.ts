import { DB } from "@db/schema";
import { Kysely } from "kysely";

export function getActiveSubscription(accountId: string, db: Kysely<DB>) {
  return db
    .selectFrom("Subscription")
    .where("accountId", "=", accountId)
    .where("status", "!=", "CANCELED");
}
