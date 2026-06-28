import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { database } from "@blinkdisk/db/index";
import {
  account,
  space,
  trial as trialTable,
  vault,
} from "@blinkdisk/db/schema";
import { sendEmail } from "@blinkdisk/utils/email";
import { deleteVaults } from "@cloud/utils/vault";
import { waitUntil } from "@cloud/utils/workflows";
import { and, eq } from "drizzle-orm";

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
          const [trial] = await db
            .select({
              id: trialTable.id,
              endsAt: trialTable.endsAt,
              email: account.email,
              language: account.language,
            })
            .from(trialTable)
            .innerJoin(account, eq(account.id, trialTable.accountId))
            .where(
              and(
                eq(trialTable.id, event.payload.trialId),
                eq(trialTable.status, "ACTIVE"),
              ),
            )
            .limit(1);

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
      const [trial] = await db
        .select({
          id: trialTable.id,
          endsAt: trialTable.endsAt,
          spaceId: space.id,
        })
        .from(trialTable)
        .innerJoin(space, eq(space.trialId, trialTable.id))
        .where(
          and(
            eq(trialTable.id, event.payload.trialId),
            eq(trialTable.status, "ACTIVE"),
          ),
        )
        .limit(1);

      if (!trial || !datesMatch(trial.endsAt, endsAt)) return { skipped: true };

      const stub = this.env.SPACE.getByName(trial.spaceId);
      await stub.updateCapacity(0);

      const vaults = await db
        .select({ id: vault.id })
        .from(vault)
        .where(
          and(
            eq(vault.provider, "CLOUDBLINK"),
            eq(vault.spaceId, trial.spaceId),
            eq(vault.status, "ACTIVE"),
          ),
        );

      if (vaults.length) await deleteVaults(db, this.env, vaults);

      await db
        .update(space)
        .set({
          used: 0,
          capacity: 0,
          trialId: null,
        })
        .where(eq(space.id, trial.spaceId));

      await db
        .update(trialTable)
        .set({
          status: "ENDED",
          endedAt: new Date(),
        })
        .where(eq(trialTable.id, trial.id));

      return { skipped: false, vaults: vaults.length };
    });
  }
}
