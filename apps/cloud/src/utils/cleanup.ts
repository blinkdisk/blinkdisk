import { FREE_SPACE_AVAILABLE } from "@config/space";
import { Database } from "@db/index";
import { sendEmail } from "@utils/email";

export async function sendCleanupEmails(db: Database, scheduledTime: number) {
  const start = new Date(scheduledTime);
  const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 7);

  const subscriptions = await db
    .selectFrom("Subscription")
    .innerJoin("Account", "Account.id", "Subscription.accountId")
    .select([
      "Subscription.id",
      "Subscription.cleanupAt",
      "Account.email",
      "Account.language",
    ])
    .where("Subscription.cleanupAt", ">", start)
    .where("Subscription.cleanupAt", "<", end)
    .execute();

  for (const subscription of subscriptions) {
    const daysLeft = subscription.cleanupAt
      ? Math.round(
          (subscription.cleanupAt?.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    await sendEmail("cleanup", subscription, {
      daysLeft,
    });
  }
}

export async function cleanup(
  db: Database,
  scheduledTime: number,
  env: CloudflareBindings,
) {
  const end = new Date(scheduledTime);
  const start = new Date(end.getTime() - 1000 * 60 * 60 * 24);

  const spaces = await db
    .selectFrom("Subscription")
    .innerJoin("Space", "Space.subscriptionId", "Subscription.id")
    .select(["Space.id"])
    .where("Subscription.cleanupAt", ">", start)
    .where("Subscription.cleanupAt", "<", end)
    .execute();

  if (!spaces.length) return;

  const vaults = await db
    .selectFrom("Vault")
    .select(["id"])
    .where("provider", "=", "BLINKDISK_CLOUD")
    .where(
      "spaceId",
      "in",
      spaces.map((space) => space.id),
    )
    .where("status", "=", "ACTIVE")
    .execute();

  if (!vaults.length) return;

  for (const space of spaces) {
    const stub = env.SPACE.getByName(space.id);
    await stub.updateCapacity(FREE_SPACE_AVAILABLE, 0);
  }

  await db
    .updateTable("Space")
    .set({ used: String(0), capacity: FREE_SPACE_AVAILABLE.toString() })
    .where(
      "id",
      "in",
      spaces.map((space) => space.id),
    )
    .execute();

  await db
    .updateTable("Vault")
    .set({ status: "DELETED" })
    .where(
      "id",
      "in",
      vaults.map((s) => s.id),
    )
    .execute();

  for (const vault of vaults) {
    const stub = env.VAULT.getByName(vault.id);
    await stub.delete(vault.id, false);
  }
}
