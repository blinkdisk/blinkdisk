import { Database } from "@blinkdisk/db/index";
import { sendEmail } from "@blinkdisk/utils/email";
import { deleteVaults } from "@cloud/utils/vault";

export async function sendCancellationEmails(
  db: Database,
  scheduledTime: number,
) {
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

    await sendEmail("cancellationWarning", subscription, {
      daysLeft,
    });
  }
}

export async function deleteCancelled(
  db: Database,
  scheduledTime: number,
  env: CloudflareBindings,
) {
  const end = new Date(scheduledTime);
  const start = new Date(end.getTime() - 1000 * 60 * 60 * 24);

  const spaces = await db
    .selectFrom("Subscription")
    .innerJoin("Space", "Space.subscriptionId", "Subscription.id")
    .select(["Space.id", "Space.accountId"])
    .where("Subscription.cleanupAt", ">", start)
    .where("Subscription.cleanupAt", "<", end)
    .execute();

  if (!spaces.length) return;

  for (const space of spaces) {
    const stub = env.SPACE.getByName(space.id);
    await stub.updateCapacity(0);
  }

  await db
    .updateTable("Space")
    .set({
      capacity: "0",
      subscriptionId: null,
    })
    .where(
      "id",
      "in",
      spaces.map((space) => space.id),
    )
    .execute();

  const vaults = await db
    .selectFrom("Vault")
    .select(["id"])
    .where("provider", "=", "CLOUDBLINK")
    .where(
      "spaceId",
      "in",
      spaces.map((space) => space.id),
    )
    .where("status", "=", "ACTIVE")
    .execute();

  if (!vaults.length) return;

  await deleteVaults(db, env, vaults);
}
