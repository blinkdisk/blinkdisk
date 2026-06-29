import { getPolar } from "@api/lib/polar";
import { posthog } from "@api/lib/posthog";
import { activeSubscriptionFilter } from "@api/lib/subscription";
import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { SUBSCRIPTION_PLANS } from "@blinkdisk/constants/plans";
import {
  account,
  space as spaceTable,
  subscription as subscriptionTable,
} from "@blinkdisk/db/schema";
import { ZChangePlan, ZCreateCheckout } from "@blinkdisk/schemas/payment";
import { CustomError } from "@blinkdisk/utils/error";
import { formatSubscriptionEn } from "@blinkdisk/utils/format";
import { logsnag } from "@blinkdisk/utils/logsnag";
import { eq } from "drizzle-orm";

export const paymentRouter = router({
  checkout: authedProcedure
    .input(ZCreateCheckout)
    .mutation(async ({ input, ctx }) => {
      const [subscription] = await ctx.db
        .select({ id: subscriptionTable.id })
        .from(subscriptionTable)
        .where(activeSubscriptionFilter(ctx.account.id))
        .limit(1);

      if (subscription) throw new CustomError("SUBSCRIPTION_EXISTS");

      const plan = SUBSCRIPTION_PLANS.find((plan) =>
        plan.prices.find((p) => p.id === input.priceId),
      );

      if (!plan) throw new CustomError("PRICE_NOT_FOUND");

      const price = plan.prices.find((p) => p.id === input.priceId);
      if (!price?.polarId) throw new CustomError("PRICE_NOT_FOUND");

      const [space] = await ctx.db
        .select({ id: spaceTable.id })
        .from(spaceTable)
        .where(eq(spaceTable.accountId, ctx.account.id))
        .limit(1);

      if (space) {
        const stub = ctx.env.SPACE.getByName(space.id);
        const used = await (
          stub as unknown as { getUsed: () => Promise<number> }
        ).getUsed();

        const bytes = plan.storageGB * 1000 * 1000 * 1000;
        if (used > bytes) throw new CustomError("NOT_ALLOWED");
      }

      const [accountRecord] = await ctx.db
        .select({ polarId: account.polarId })
        .from(account)
        .where(eq(account.id, ctx.account.id))
        .limit(1);

      if (!accountRecord || !ctx.account) throw new CustomError("NOT_ALLOWED");

      const polar = getPolar(ctx.env.POLAR_ENVIRONMENT, ctx.env.POLAR_TOKEN);

      let polarId = accountRecord.polarId;
      if (!accountRecord.polarId) {
        const customer = await polar.customers.create({
          externalId: ctx.account.id,
          email: ctx.account.email,
          name: ctx.account.name,
        });

        polarId = customer.id;

        await ctx.db
          .update(account)
          .set({
            polarId,
          })
          .where(eq(account.id, ctx.account.id));
      }

      const checkout = await polar.checkouts.create({
        customerId: polarId,
        allowDiscountCodes: true,
        successUrl: `${ctx.env.WEB_URL}/checkout/success`,
        products: [
          price.polarId[ctx.env.POLAR_ENVIRONMENT as "sandbox" | "production"],
        ],
      });

      ctx.waitUntil(
        (async () => {
          await logsnag({
            icon: "🛒",
            title: "Checkout started",
            description: `Checkout for ${plan.storageGB.toLocaleString()} GB (${price.amount.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 0,
                style: "currency",
                currency: price.currency,
              },
            )}/${price.period === "MONTHLY" ? "mo" : "yr"}) started by ${ctx.account?.email}.`,
            channel: "checkouts",
          });

          await posthog({
            distinctId: ctx.account.id,
            event: "checkout_start",
            properties: {
              planId: plan.id,
              priceId: price.id,
              amount: price.amount,
              currency: price.currency,
              period: price.period,
            },
          });
        })(),
      );

      return { id: checkout.id, url: checkout.url };
    }),
  getSubscription: authedProcedure.query(async ({ ctx }) => {
    const [subscription] = await ctx.db
      .select({
        id: subscriptionTable.id,
        status: subscriptionTable.status,
        planId: subscriptionTable.planId,
        priceId: subscriptionTable.priceId,
      })
      .from(subscriptionTable)
      .where(activeSubscriptionFilter(ctx.account.id))
      .limit(1);

    if (!subscription) return null;
    return subscription;
  }),
  billing: authedProcedure.query(async ({ ctx }) => {
    const [accountRecord] = await ctx.db
      .select({ polarId: account.polarId })
      .from(account)
      .where(eq(account.id, ctx.account.id))
      .limit(1);

    return {
      portalEnabled: !!accountRecord?.polarId,
    };
  }),
  portal: authedProcedure.query(async ({ ctx }) => {
    const [accountRecord] = await ctx.db
      .select({ polarId: account.polarId })
      .from(account)
      .where(eq(account.id, ctx.account.id))
      .limit(1);

    if (!accountRecord?.polarId) throw new CustomError("NOT_ALLOWED");

    const polar = getPolar(ctx.env.POLAR_ENVIRONMENT, ctx.env.POLAR_TOKEN);

    const portal = await polar.customerSessions.create({
      customerId: accountRecord.polarId,
    });

    return {
      url: portal.customerPortalUrl,
    };
  }),
  changePlan: authedProcedure
    .input(ZChangePlan)
    .mutation(async ({ input, ctx }) => {
      const plan = SUBSCRIPTION_PLANS.find((plan) =>
        plan.prices.find((p) => p.id === input.priceId),
      );
      if (!plan) throw new CustomError("PRICE_NOT_FOUND");

      const price = plan.prices.find((p) => p.id === input.priceId);
      if (!price?.polarId) throw new CustomError("PRICE_NOT_FOUND");

      const [current] = await ctx.db
        .select({
          id: subscriptionTable.id,
          priceId: subscriptionTable.priceId,
          polarSubscriptionId: subscriptionTable.polarSubscriptionId,
        })
        .from(subscriptionTable)
        .where(activeSubscriptionFilter(ctx.account.id))
        .limit(1);

      if (!current) throw new CustomError("SUBSCRIPTION_NOT_FOUND");

      const currentPlan = SUBSCRIPTION_PLANS.find((p) =>
        p.prices.find((price) => price.id === current.priceId),
      );

      const currentPrice = currentPlan?.prices.find(
        (price) => price.id === current.priceId,
      );

      if (input.priceId === current.priceId)
        throw new CustomError("NOT_ALLOWED");

      const [space] = await ctx.db
        .select({ id: spaceTable.id })
        .from(spaceTable)
        .where(eq(spaceTable.subscriptionId, current.id))
        .limit(1);

      if (!space) throw new CustomError("SPACE_NOT_FOUND");

      const stub = ctx.env.SPACE.getByName(space.id);

      const used = await (
        stub as unknown as { getUsed: (id: string) => Promise<number> }
      ).getUsed(space.id);

      const bytes = plan.storageGB * 1000 * 1000 * 1000;
      if (used > bytes) throw new CustomError("NOT_ALLOWED");

      const polar = getPolar(ctx.env.POLAR_ENVIRONMENT, ctx.env.POLAR_TOKEN);

      await polar.subscriptions.update({
        id: current.polarSubscriptionId,
        subscriptionUpdate: {
          productId:
            price.polarId[
              ctx.env.POLAR_ENVIRONMENT === "sandbox" ? "sandbox" : "production"
            ],
          prorationBehavior: "invoice",
        },
      });

      const posthogProperties = {
        planId: plan.id,
        priceId: price.id,
        amount: price.amount,
        currency: price.currency,
        period: price.period,
      };

      if (currentPlan?.id === plan.id)
        ctx.waitUntil(
          (async () => {
            await logsnag({
              icon: "🔁",
              title: "Subscription period changed",
              description: `Period changed from ${currentPrice?.period.toLowerCase()} to ${price.period.toLowerCase()} by ${ctx.account?.email}.`,
              channel: "subscriptions",
            });

            await posthog({
              distinctId: ctx.account.id,
              event: "subscription_period_change",
              properties: posthogProperties,
            });
          })(),
        );
      else if ((currentPlan?.storageGB || 0) < plan.storageGB)
        ctx.waitUntil(
          (async () => {
            await logsnag({
              icon: "🔼",
              title: "Subscription upgraded",
              description: `Subscription upgraded from ${formatSubscriptionEn(currentPlan, currentPrice)} to ${formatSubscriptionEn(plan, price)} GB by ${ctx.account?.email}.`,
              channel: "subscriptions",
            });

            await posthog({
              distinctId: ctx.account.id,
              event: "subscription_upgrade",
              properties: posthogProperties,
            });
          })(),
        );
      else
        ctx.waitUntil(
          (async () => {
            await logsnag({
              icon: "🔽",
              title: "Subscription downgraded",
              description: `Subscription downgraded from ${formatSubscriptionEn(currentPlan, currentPrice)} to ${formatSubscriptionEn(plan, price)} GB by ${ctx.account?.email}.`,
              channel: "subscriptions",
            });

            await posthog({
              distinctId: ctx.account.id,
              event: "subscription_downgrade",
              properties: posthogProperties,
            });
          })(),
        );

      for (let i = 0; i < 10; i++) {
        const updatedSubscription = await ctx.db
          .select({ priceId: subscriptionTable.priceId })
          .from(subscriptionTable)
          .where(eq(subscriptionTable.id, current.id))
          .limit(1);

        if (updatedSubscription[0]?.priceId === input.priceId) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }),
});
