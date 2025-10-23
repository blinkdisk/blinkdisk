import { plans } from "@config/plans";
import { FREE_SPACE_AVAILABLE } from "@config/space";
import { head } from "@landing/utils/head";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { ArrowLeftIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/pricing")({
  component: RouteComponent,
  head: head({
    title: "Pricing",
    description:
      "The pricing for BlinkDisk Cloud, our managed cloud backup service.",
  }),
});

type BillingPeriod = "YEARLY" | "MONTHLY";

function RouteComponent() {
  const currency = "USD";

  const [groupIndex, setGroupIndex] = useState(0);
  const [period, setPeriod] = useState<BillingPeriod>("YEARLY");

  const groupPlans = useMemo(() => plans.filter((plan) => plan.group), []);
  const groupPlan = useMemo(
    () => groupPlans[groupIndex],
    [groupPlans, groupIndex],
  );

  return (
    <div className="py-page flex min-h-screen flex-col items-center">
      <div className="mt-auto"></div>
      <h2 className="text-center text-3xl font-bold tracking-tighter sm:text-[3rem] sm:leading-[3rem]">
        Cloud Storage Pricing
      </h2>
      <p className="text-muted-foreground mt-4 max-w-[80vw] text-center text-sm sm:max-w-lg sm:text-base">
        BlinkDisk Cloud gives you secure, end-to-end-encrypted backups without
        the hassle of setup. Simple, transparent pricing.
      </p>
      <Tabs
        value={period}
        onValueChange={(to) => setPeriod(to as BillingPeriod)}
        className="mt-6 sm:!mt-10"
      >
        <TabsList>
          <TabsTrigger className="px-6" value="MONTHLY">
            Monthly
          </TabsTrigger>
          <TabsTrigger className="px-3" value="YEARLY">
            Yearly
            <Badge variant="subtle">Save ~25%</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="sm:!mt-18 mt-12 flex flex-row flex-wrap items-center justify-center gap-8">
        <Plan
          plan={{
            id: "free",
            storageGB: FREE_SPACE_AVAILABLE / 1000 / 1000 / 1000,
            prices: [],
            free: true,
          }}
          period={period}
          currency={currency}
        />
        {plans
          .filter((plan) => !plan.group)
          .map((plan) => (
            <Plan
              key={plan.id}
              plan={plan}
              period={period}
              currency={currency}
            />
          ))}
        {groupPlan && (
          <Plan
            plan={groupPlan}
            period={period}
            currency={currency}
            groupIndex={groupIndex}
            setGroupIndex={setGroupIndex}
            maxGroupIndex={groupPlans.length - 1}
          />
        )}
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}

type PlanProps = {
  plan: (typeof plans)[number] & { free?: boolean };
  period: BillingPeriod;
  currency: string;
  groupIndex?: number;
  setGroupIndex?: (index: number) => void;
  maxGroupIndex?: number;
};

function Plan({
  plan,
  period,
  currency,
  groupIndex,
  setGroupIndex,
  maxGroupIndex,
}: PlanProps) {
  const [contact, setContact] = useState(false);

  const price = useMemo(
    () =>
      plan.prices.find(
        (price) => price.period === period && price.currency === currency,
      ),
    [plan, period, currency],
  );

  const savings = useMemo(() => {
    if (period === "MONTHLY" || !price) return null;

    const monthlyPrice = plan.prices.find(
      (price) => price.period === "MONTHLY" && price.currency === currency,
    );

    if (!monthlyPrice) return null;

    const original = monthlyPrice.amount;
    const yearly = original * 12 - price.amount;

    return {
      original,
      yearly,
    };
  }, [price, period, currency, plan.prices]);

  const monthlyAmount = useMemo(() => {
    if (!price) return null;
    if (period === "MONTHLY") return price.amount;
    return price.amount / 12;
  }, [price, period]);

  if (!price && !plan.free) return null;
  return (
    <div className="bg-card text-card-foreground h-70 relative flex w-[90%] flex-col justify-between rounded-xl border p-6 sm:!w-72">
      <div className="flex flex-col">
        {!contact ? (
          <>
            <div className="flex items-center justify-center gap-2 xl:gap-3">
              {setGroupIndex ? (
                <Button
                  size="icon-xs"
                  variant="outline"
                  onClick={() => setGroupIndex((groupIndex || 0) - 1)}
                  disabled={groupIndex === 0}
                >
                  <MinusIcon className="size-4" />
                </Button>
              ) : null}
              <p className="text-center text-3xl font-bold">
                {plan.storageGB.toLocaleString()} GB
              </p>
              {setGroupIndex ? (
                <Button
                  size="icon-xs"
                  onClick={() =>
                    groupIndex === maxGroupIndex
                      ? setContact(true)
                      : setGroupIndex((groupIndex || 0) + 1)
                  }
                  disabled={contact}
                >
                  <PlusIcon className="size-4" />
                </Button>
              ) : null}
            </div>
            {!contact ? (
              <p className="text-muted-foreground mt-1 text-center text-xs">
                Enjoy {plan.storageGB.toLocaleString()} GB of cloud storage
              </p>
            ) : null}
          </>
        ) : (
          <Button onClick={() => setContact(false)} variant="outline" size="sm">
            <ArrowLeftIcon className="size-4" />
            Go Back
          </Button>
        )}
      </div>
      {!contact ? (
        <div className="my-3 flex h-20 flex-col items-start justify-center">
          {savings ? (
            <p className="text-muted-foreground text-sm line-through">
              {savings.original?.toLocaleString(undefined, {
                style: "currency",
                minimumFractionDigits: 0,
                currency,
              })}
              /month
            </p>
          ) : null}
          <p className="text-2xl font-semibold">
            {plan.free ? (
              "100% Free"
            ) : (
              <>
                {monthlyAmount?.toLocaleString(undefined, {
                  style: "currency",
                  minimumFractionDigits: 0,
                  currency,
                })}
                <span key={1} className="text-sm font-normal">
                  /month
                </span>
              </>
            )}
          </p>
          {savings ? (
            <p className="text-primary text-sm">
              Save{" "}
              {savings.yearly?.toLocaleString(undefined, {
                style: "currency",
                minimumFractionDigits: 0,
                currency,
              })}{" "}
              yearly
            </p>
          ) : null}
        </div>
      ) : (
        <div>
          <p className="text-lg font-semibold tracking-tight">
            Looking for more storage?
          </p>
          <p className="text-muted-foreground text-sm">
            Feel free to contact us at cloud@blinkdisk.com for a quote.
          </p>
        </div>
      )}
      <div className="mt-2 [&>button]:w-full">
        {contact ? (
          <Button onClick={() => window.open("mailto:cloud@blinkdisk.com")}>
            Contact Us
          </Button>
        ) : (
          <Button as="link" to="/download" variant="outline" className="w-full">
            Download
          </Button>
        )}
      </div>
    </div>
  );
}
