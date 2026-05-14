import { database } from "@blinkdisk/db/index";
import { sendEmail } from "@blinkdisk/utils/email";
import { deleteVaults } from "@cloud/utils/vault";
import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";

const DAY_MS = 1000 * 60 * 60 * 24;

export type CancellationWorkflowParams = {
  subscriptionId: string;
  cleanupAt: string;
};

function datesMatch(left: Date | string | null, right: Date) {
  if (!left) return false;
  return new Date(left).getTime() === right.getTime();
}

export class CancellationWorkflow extends WorkflowEntrypoint<
  CloudflareBindings,
  CancellationWorkflowParams
> {
  async run(
    event: WorkflowEvent<CancellationWorkflowParams>,
    step: WorkflowStep,
  ) {
    const cleanupAt = new Date(event.payload.cleanupAt);

    for (const daysLeft of [7, 6, 5, 4, 3, 2, 1]) {
      const warningAt = new Date(cleanupAt.getTime() - DAY_MS * daysLeft);

      await step.sleepUntil(
        `wait until cancellation warning ${daysLeft} days left`,
        warningAt,
      );

      await step.do(
        `send cancellation warning email ${daysLeft} days left`,
        async () => {
          const db = database(this.env.HYPERDRIVE.connectionString);
          const subscription = await db
            .selectFrom("Subscription")
            .innerJoin("Account", "Account.id", "Subscription.accountId")
            .select([
              "Subscription.id",
              "Subscription.cleanupAt",
              "Account.email",
              "Account.language",
            ])
            .where("Subscription.id", "=", event.payload.subscriptionId)
            .executeTakeFirst();

          if (!subscription || !datesMatch(subscription.cleanupAt, cleanupAt))
            return { skipped: true };

          await sendEmail("cancellationWarning", subscription, {
            daysLeft,
          });

          return { skipped: false };
        },
      );
    }

    await step.sleepUntil("wait until subscription cleanup", cleanupAt);

    await step.do("delete cancelled subscription vaults", async () => {
      const db = database(this.env.HYPERDRIVE.connectionString);
      const subscription = await db
        .selectFrom("Subscription")
        .select(["id", "cleanupAt"])
        .where("id", "=", event.payload.subscriptionId)
        .executeTakeFirst();

      if (!subscription || !datesMatch(subscription.cleanupAt, cleanupAt))
        return { skipped: true };

      const spaces = await db
        .selectFrom("Space")
        .select(["id", "accountId"])
        .where("subscriptionId", "=", subscription.id)
        .execute();

      if (!spaces.length) return { skipped: false, vaults: 0 };

      for (const space of spaces) {
        const stub = this.env.SPACE.getByName(space.id);
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

      if (vaults.length) await deleteVaults(db, this.env, vaults);

      return { skipped: false, vaults: vaults.length };
    });
  }
}
