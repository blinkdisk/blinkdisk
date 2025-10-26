import { CustomError } from "@api/lib/error";
import { getPolar } from "@api/lib/polar";
import { posthog } from "@api/lib/posthog";
import { getActiveSubscription } from "@api/lib/subscription";
import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { plans } from "@config/plans";
import { ZChangePlan, ZCreateCheckout } from "@schemas/payment";
import { formatSubscriptionEn } from "@utils/format";
import { logsnag } from "@utils/logsnag";

export const paymentRouter = router({
  checkout: authedProcedure
    .input(ZCreateCheckout)
    .mutation(async ({ input, ctx }) => {
      const subscription = await getActiveSubscription(ctx.account?.id!, ctx.db)
        .select(["id"])
        .executeTakeFirst();

      if (subscription) throw new CustomError("SUBSCRIPTION_EXISTS");

      const plan = plans.find((plan) =>
        plan.prices.find((p) => p.id === input.priceId),
      );

      if (!plan) throw new CustomError("PRICE_NOT_FOUND");

      const price = plan.prices.find((p) => p.id === input.priceId);
      if (!price || !price.polarId) throw new CustomError("PRICE_NOT_FOUND");

      const account = await ctx.db
        .selectFrom("Account")
        .select(["polarId"])
        .where("id", "=", ctx.account?.id!)
        .executeTakeFirst();

      if (!account || !ctx.account) throw new CustomError("NOT_ALLOWED");

      const polar = getPolar(ctx.env.POLAR_ENVIRONMENT, ctx.env.POLAR_TOKEN);

      let polarId = account.polarId;
      if (!account.polarId) {
        const customer = await polar.customers.create({
          externalId: ctx.account.id,
          email: ctx.account.email,
          name: ctx.account.name,
        });

        polarId = customer.id;

        await ctx.db
          .updateTable("Account")
          .set({
            polarId,
          })
          .where("id", "=", ctx.account?.id!)
          .execute();
      }

      const checkout = await polar.checkouts.create({
        customerId: polarId,
        allowDiscountCodes: true,
        successUrl: `${ctx.env.LANDING_URL}/checkout/success`,
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
            distinctId: ctx.account?.id!,
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

      return { url: checkout.url };
    }),
  getSubscription: authedProcedure.query(async ({ ctx }) => {
    const subscription = await getActiveSubscription(ctx.account?.id!, ctx.db)
      .select(["id", "status", "planId", "priceId"])
      .executeTakeFirst();

    if (!subscription) return null;
    return subscription;
  }),
  billing: authedProcedure.query(async ({ ctx }) => {
    const account = await ctx.db
      .selectFrom("Account")
      .select(["polarId"])
      .where("id", "=", ctx.account?.id!)
      .executeTakeFirst();

    return {
      portalEnabled: !!account?.polarId,
    };
  }),
  portal: authedProcedure.query(async ({ ctx }) => {
    const account = await ctx.db
      .selectFrom("Account")
      .select(["polarId"])
      .where("id", "=", ctx.account?.id!)
      .executeTakeFirst();

    if (!account || !account.polarId) throw new CustomError("NOT_ALLOWED");

    const polar = getPolar(ctx.env.POLAR_ENVIRONMENT, ctx.env.POLAR_TOKEN);

    const portal = await polar.customerSessions.create({
      customerId: account.polarId,
    });

    return {
      url: portal.customerPortalUrl,
    };
  }),
  changePlan: authedProcedure
    .input(ZChangePlan)
    .mutation(async ({ input, ctx }) => {
      const plan = plans.find((plan) =>
        plan.prices.find((p) => p.id === input.priceId),
      );
      if (!plan) throw new CustomError("PRICE_NOT_FOUND");

      const price = plan.prices.find((p) => p.id === input.priceId);
      if (!price || !price.polarId) throw new CustomError("PRICE_NOT_FOUND");

      const current = await getActiveSubscription(ctx.account?.id!, ctx.db)
        .select(["id", "priceId", "polarSubscriptionId"])
        .executeTakeFirst();

      if (!current) throw new CustomError("SUBSCRIPTION_NOT_FOUND");

      const currentPlan = plans.find((p) =>
        p.prices.find((price) => price.id === current.priceId),
      );

      const currentPrice = currentPlan?.prices.find(
        (price) => price.id === current.priceId,
      );

      if (input.priceId === current.priceId)
        throw new CustomError("NOT_ALLOWED");

      const space = await ctx.db
        .selectFrom("Space")
        .select(["id"])
        .where("subscriptionId", "=", current.id)
        .executeTakeFirst();

      if (!space) throw new CustomError("SPACE_NOT_FOUND");

      const stub = (ctx.env.SPACE as any).getByName(space.id);
      const used = await stub.getUsed(space.id);

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
              distinctId: ctx.account?.id!,
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
              distinctId: ctx.account?.id!,
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
              distinctId: ctx.account?.id!,
              event: "subscription_downgrade",
              properties: posthogProperties,
            });
          })(),
        );

      for (let i = 0; i < 10; i++) {
        const updatedSubscription = await ctx.db
          .selectFrom("Subscription")
          .select(["priceId"])
          .where("id", "=", current.id)
          .executeTakeFirst();

        if (updatedSubscription?.priceId === input.priceId) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }),
});
