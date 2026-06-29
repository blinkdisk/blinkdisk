import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { database } from "@blinkdisk/db/index";
import {
  account,
  space,
  subscription as subscriptionTable,
  vault,
} from "@blinkdisk/db/schema";
import { sendEmail } from "@blinkdisk/utils/email";
import { deleteVaults } from "@cloud/utils/vault";
import { waitUntil } from "@cloud/utils/workflows";
import { and, eq, inArray } from "drizzle-orm";

const DAY_MS = 1000 * 60 * 60 * 24;

type CancellationWorkflowParams = {
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

      await waitUntil(
        this.env,
        step,
        `wait until cancellation warning ${daysLeft} days left`,
        warningAt,
      );

      await step.do(
        `send cancellation warning email ${daysLeft} days left`,
        async () => {
          const db = database(this.env.HYPERDRIVE.connectionString);
          const [subscription] = await db
            .select({
              id: subscriptionTable.id,
              cleanupAt: subscriptionTable.cleanupAt,
              email: account.email,
              language: account.language,
            })
            .from(subscriptionTable)
            .innerJoin(account, eq(account.id, subscriptionTable.accountId))
            .where(eq(subscriptionTable.id, event.payload.subscriptionId))
            .limit(1);

          if (!subscription || !datesMatch(subscription.cleanupAt, cleanupAt))
            return { skipped: true };

          await sendEmail("cancellationWarning", subscription, {
            daysLeft,
          });

          return { skipped: false };
        },
      );
    }

    await waitUntil(
      this.env,
      step,
      "wait until subscription cleanup",
      cleanupAt,
    );

    await step.do("delete cancelled subscription vaults", async () => {
      const db = database(this.env.HYPERDRIVE.connectionString);
      const [subscription] = await db
        .select({
          id: subscriptionTable.id,
          cleanupAt: subscriptionTable.cleanupAt,
        })
        .from(subscriptionTable)
        .where(eq(subscriptionTable.id, event.payload.subscriptionId))
        .limit(1);

      if (!subscription || !datesMatch(subscription.cleanupAt, cleanupAt))
        return { skipped: true };

      const spaces = await db
        .select({ id: space.id, accountId: space.accountId })
        .from(space)
        .where(eq(space.subscriptionId, subscription.id));

      if (!spaces.length) return { skipped: false, vaults: 0 };

      for (const space of spaces) {
        const stub = this.env.SPACE.getByName(space.id);
        await stub.updateCapacity(0);
      }

      const vaults = await db
        .select({ id: vault.id })
        .from(vault)
        .where(
          and(
            eq(vault.provider, "CLOUDBLINK"),
            inArray(
              vault.spaceId,
              spaces.map((space) => space.id),
            ),
            eq(vault.status, "ACTIVE"),
          ),
        );

      if (vaults.length) await deleteVaults(db, this.env, vaults);

      await db
        .update(space)
        .set({
          used: 0,
          capacity: 0,
          subscriptionId: null,
        })
        .where(
          inArray(
            space.id,
            spaces.map((space) => space.id),
          ),
        );

      return { skipped: false, vaults: vaults.length };
    });
  }
}
