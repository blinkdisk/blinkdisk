import { database } from "@blinkdisk/db/index";
import { sendEmail } from "@blinkdisk/utils/email";
import { waitUntil } from "@cloud/utils/workflows";
import { deleteVaults } from "@cloud/utils/vault";
import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";

const DAY_MS = 1000 * 60 * 60 * 24;

type TrialWorkflowParams = {
  trialId: string;
  endsAt: string;
};

function datesMatch(left: Date | string | null, right: Date) {
  if (!left) return false;
  return new Date(left).getTime() === right.getTime();
}

export class TrialWorkflow extends WorkflowEntrypoint<
  CloudflareBindings,
  TrialWorkflowParams
> {
  async run(event: WorkflowEvent<TrialWorkflowParams>, step: WorkflowStep) {
    const endsAt = new Date(event.payload.endsAt);

    for (const daysLeft of [7, 6, 5, 4, 3, 2, 1]) {
      const warningAt = new Date(endsAt.getTime() - DAY_MS * daysLeft);

      await waitUntil(
        this.env,
        step,
        `wait until trial warning ${daysLeft} days left`,
        warningAt,
      );

      await step.do(
        `send trial warning email ${daysLeft} days left`,
        async () => {
          const db = database(this.env.HYPERDRIVE.connectionString);
          const trial = await db
            .selectFrom("Trial")
            .innerJoin("Account", "Account.id", "Trial.accountId")
            .select([
              "Trial.id",
              "Trial.endsAt",
              "Account.email",
              "Account.language",
            ])
            .where("Trial.id", "=", event.payload.trialId)
            .where("Trial.status", "=", "ACTIVE")
            .executeTakeFirst();

          if (!trial || !datesMatch(trial.endsAt, endsAt))
            return { skipped: true };

          await sendEmail("trialWarning", trial, {
            daysLeft,
          });

          return { skipped: false };
        },
      );
    }

    await waitUntil(this.env, step, "wait until trial ends", endsAt);

    await step.do("end trial and delete vaults", async () => {
      const db = database(this.env.HYPERDRIVE.connectionString);
      const trial = await db
        .selectFrom("Trial")
        .innerJoin("Space", "Space.trialId", "Trial.id")
        .select(["Trial.id", "Trial.endsAt", "Space.id as spaceId"])
        .where("Trial.id", "=", event.payload.trialId)
        .where("Trial.status", "=", "ACTIVE")
        .executeTakeFirst();

      if (!trial || !datesMatch(trial.endsAt, endsAt)) return { skipped: true };

      const stub = this.env.SPACE.getByName(trial.spaceId);
      await stub.updateCapacity(0);

      await db
        .updateTable("Space")
        .set({
          capacity: "0",
          trialId: null,
        })
        .where("id", "=", trial.spaceId)
        .execute();

      await db
        .updateTable("Trial")
        .set({
          status: "ENDED",
          endedAt: new Date(),
        })
        .where("id", "=", trial.id)
        .execute();

      const vaults = await db
        .selectFrom("Vault")
        .select(["id"])
        .where("provider", "=", "CLOUDBLINK")
        .where("spaceId", "=", trial.spaceId)
        .where("status", "=", "ACTIVE")
        .execute();

      if (vaults.length) await deleteVaults(db, this.env, vaults);

      return { skipped: false, vaults: vaults.length };
    });
  }
}
