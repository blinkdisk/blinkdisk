import { subscription } from "@blinkdisk/db/schema";
import { and, eq, ne } from "drizzle-orm";

export function activeSubscriptionFilter(accountId: string) {
  return and(
    eq(subscription.accountId, accountId),
    ne(subscription.status, "CANCELED"),
  );
}
