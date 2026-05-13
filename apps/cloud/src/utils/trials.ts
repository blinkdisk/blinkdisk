import { Database } from "@blinkdisk/db/index";
import { sendEmail } from "@blinkdisk/utils/email";
import { deleteVaults } from "@cloud/utils/vault";

export async function sendTrialEmails(db: Database, scheduledTime: number) {
  const start = new Date(scheduledTime);
  const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 7);

  const trials = await db
    .selectFrom("Trial")
    .innerJoin("Account", "Account.id", "Trial.accountId")
    .select(["Trial.id", "Trial.endsAt", "Account.email", "Account.language"])
    .where("Trial.status", "=", "ACTIVE")
    .where("Trial.endsAt", ">", start)
    .where("Trial.endsAt", "<", end)
    .execute();

  for (const trial of trials) {
    const daysLeft = trial.endsAt
      ? Math.round(
          (trial.endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        )
      : 0;

    await sendEmail("trialWarning", trial, {
      daysLeft,
    });
  }
}

export async function endTrials(
  db: Database,
  scheduledTime: number,
  env: CloudflareBindings,
) {
  const end = new Date(scheduledTime);
  const start = new Date(end.getTime() - 1000 * 60 * 60 * 24);

  const trials = await db
    .selectFrom("Trial")
    .innerJoin("Space", "Space.trialId", "Trial.id")
    .select(["Trial.id", "Space.id as spaceId", "Trial.accountId"])
    .where("Trial.status", "=", "ACTIVE")
    .where("Trial.endsAt", ">", start)
    .where("Trial.endsAt", "<", end)
    .execute();

  if (!trials.length) return;

  for (const trial of trials) {
    const stub = env.SPACE.getByName(trial.spaceId);
    await stub.updateCapacity(0);
  }

  await db
    .updateTable("Space")
    .set({
      capacity: "0",
      trialId: null,
    })
    .where(
      "id",
      "in",
      trials.map((trial) => trial.spaceId),
    )
    .execute();

  await db
    .updateTable("Trial")
    .set({
      status: "ENDED",
      endedAt: new Date(),
    })
    .where(
      "id",
      "in",
      trials.map((trial) => trial.id),
    )
    .execute();

  const vaults = await db
    .selectFrom("Vault")
    .select(["id"])
    .where("provider", "=", "CLOUDBLINK")
    .where(
      "spaceId",
      "in",
      trials.map((trial) => trial.spaceId),
    )
    .where("status", "=", "ACTIVE")
    .execute();

  if (!vaults.length) return;

  await deleteVaults(db, env, vaults);
}
