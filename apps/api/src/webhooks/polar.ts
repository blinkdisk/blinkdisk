import { HonoContextOptions } from "@api/index";
import { posthog } from "@api/lib/posthog";
import { plans } from "@config/plans";
import { SubscriptionStatus } from "@db/enums";
import { Subscription } from "@polar-sh/sdk/models/components/subscription";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { formatSubscriptionEn } from "@utils/format";
import { generateId } from "@utils/id";
import { logsnag } from "@utils/logsnag";
import { Context } from "hono";
import { BlankInput } from "hono/types";

const MIN_GRACE_PERIOD_MS = 1000 * 60 * 60 * 24 * 7;

export async function polarWebhook(
  c: Context<HonoContextOptions, "/webhook/polar", BlankInput>,
) {
  try {
    const event = validateEvent(
      await c.req.text(),
      Object.fromEntries([...c.req.raw.headers]),
      c.env.POLAR_WEBHOOK_SECRET,
    );

    const db = c.get("db");

    if (event.type.startsWith("subscription.")) {
      const subscription = event.data as Subscription;

      if (
        // Polar mentioned these status aren't used and will
        // be removed from the API soon.
        ["incomplete", "incomplete_expired", "unpaid"].includes(
          subscription.status,
        )
      )
        subscription.status = "active";

      const plan = plans.find((plan) =>
        plan.prices.find(
          (p) =>
            p.polarId?.[
              c.env.POLAR_ENVIRONMENT === "sandbox" ? "sandbox" : "production"
            ] === subscription.productId,
        ),
      );

      const price = plan?.prices.find(
        (p) =>
          p.polarId?.[
            c.env.POLAR_ENVIRONMENT === "sandbox" ? "sandbox" : "production"
          ] === subscription.productId,
      );

      const posthogProperties = {
        planId: plan?.id,
        priceId: price?.id,
        amount: price?.amount,
        currency: price?.currency,
        period: price?.period,
      };

      let planUpdated = false;
      let accountId: string | undefined;
      let subscriptionId: string | undefined;

      if (event.type === "subscription.created") {
        if (!plan) return c.json({ error: "Plan not found" }, 400);
        if (!price) return c.json({ error: "Price not found" }, 400);

        const account = await db
          .selectFrom("Account")
          .select(["id", "email"])
          .where("polarId", "=", subscription.customerId)
          .executeTakeFirst();

        if (!account) return c.json({ error: "Account not found" }, 400);

        accountId = account.id;
        subscriptionId = generateId("Subscription");
        planUpdated = true;

        await db
          .insertInto("Subscription")
          .values({
            id: subscriptionId,
            status: subscription.status.toUpperCase() as SubscriptionStatus,
            priceId: price.id,
            planId: plan.id,
            polarProductId: subscription.productId,
            polarSubscriptionId: subscription.id,
            polarCustomerId: subscription.customerId,
            accountId,
          })
          .execute();

        c.executionCtx.waitUntil(
          (async () => {
            await logsnag({
              icon: "💳",
              title: "Subscription started",
              description: `${formatSubscriptionEn(plan, price)} subscription started by ${account?.email}.`,
              channel: "subscriptions",
            });

            await posthog({
              distinctId: account?.id!,
              event: "subscription_start",
              properties: posthogProperties,
            });
          })(),
        );
      } else if (
        [
          "subscription.created",
          "subscription.active",
          "subscription.updated",
          "subscription.canceled",
          "subscription.uncanceled",
          "subscription.revoked",
        ].includes(event.type)
      ) {
        const previous = await db
          .selectFrom("Subscription")
          .select(["id", "planId", "accountId", "cleanupAt"])
          .where("polarSubscriptionId", "=", subscription.id)
          .executeTakeFirst();

        if (!previous) return c.json({ error: "Subscription not found" }, 400);

        subscriptionId = previous.id;
        accountId = previous.accountId;

        subscription.currentPeriodEnd;

        const endsAt = ["canceled", "unpaid", "incomplete_expired"].includes(
          subscription.status,
        )
          ? subscription.endedAt
          : subscription.cancelAtPeriodEnd
            ? subscription.currentPeriodEnd
            : null;

        if (
          ["canceled", "unpaid", "incomplete_expired"].includes(
            subscription.status,
          ) &&
          !endsAt
        ) {
          await logsnag({
            icon: "❌",
            title: "FATAL ERROR",
            description: `Subscription in status ${subscription.status} but no endsAt date found.`,
            channel: "subscriptions",
          });
        }

        let cleanupAt = null;
        if (endsAt && previous.cleanupAt) {
          cleanupAt = previous.cleanupAt;
        } else if (endsAt && !previous.cleanupAt) {
          if (endsAt.getTime() - Date.now() > MIN_GRACE_PERIOD_MS)
            cleanupAt = endsAt;
          else cleanupAt = new Date(endsAt.getTime() + MIN_GRACE_PERIOD_MS);
        }

        await db
          .updateTable("Subscription")
          .set({
            status: subscription.status.toUpperCase() as SubscriptionStatus,
            polarProductId: subscription.productId,
            canceledAt: subscription.canceledAt,
            endedAt: subscription.endedAt,
            cleanupAt,
            ...(price && { priceId: price.id }),
            ...(plan && { planId: plan.id }),
          })
          .where("id", "=", previous.id)
          .execute();

        if (plan && plan.id !== previous.planId) planUpdated = true;

        const account = await db
          .selectFrom("Account")
          .select(["id", "email"])
          .where("id", "=", accountId)
          .executeTakeFirst();

        if (event.type === "subscription.canceled") {
          c.executionCtx.waitUntil(
            (async () => {
              await logsnag({
                icon: "❌",
                title: "Subscription canceled",
                description: `${formatSubscriptionEn(plan, price)} subscription canceled by ${account?.email}.`,
                channel: "subscriptions",
              });

              await posthog({
                distinctId: account?.id!,
                event: "subscription_cancel",
                properties: posthogProperties,
              });
            })(),
          );
        } else if (event.type === "subscription.uncanceled") {
          c.executionCtx.waitUntil(
            (async () => {
              await logsnag({
                icon: "❤️‍🩹",
                title: "Subscription resumed",
                description: `${formatSubscriptionEn(plan, price)} subscription resumed by ${account?.email}.`,
                channel: "subscriptions",
              });

              await posthog({
                distinctId: account?.id!,
                event: "subscription_resume",
                properties: posthogProperties,
              });
            })(),
          );
        }
      }

      if (planUpdated && accountId && plan) {
        const space = await db
          .selectFrom("Space")
          .select(["id", "capacity"])
          .where("accountId", "=", accountId)
          .executeTakeFirst();

        if (!space) return c.json({ error: "Space not found" }, 400);

        const capacity = plan.storageGB * 1000 * 1000 * 1000;

        await db
          .updateTable("Space")
          .set({
            capacity: capacity.toString(),
            subscriptionId: subscriptionId,
          })
          .where("id", "=", space.id)
          .execute();

        const stub = c.env.SPACE.getByName(space.id) as any;
        await stub.updateCapacity(capacity);
      }
    }

    return c.json(
      {
        success: true,
      },
      202,
    );
  } catch (e) {
    if (e instanceof WebhookVerificationError)
      c.json({ error: "Invalid signature" }, 400);
    return c.json({ error: "Internal server error" }, 500);
  }
}
