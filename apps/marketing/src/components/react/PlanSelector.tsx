import type { BillingPeriod, Plan } from "@config/plans";
import { plans } from "@config/plans";
import { FREE_SPACE_AVAILABLE } from "@config/space";
import { usePlanPrices } from "@hooks/use-plan-prices";
import { ArrowLeftIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";

const currency = "USD";

export default function PlanSelector() {
  const [groupIndex, setGroupIndex] = useState(0);
  const [period, setPeriod] = useState<BillingPeriod>("YEARLY");

  const groupPlans = useMemo(() => plans.filter((plan) => plan.group), []);
  const groupPlan = useMemo(
    () => groupPlans[groupIndex],
    [groupPlans, groupIndex],
  );

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <div className="bg-secondary flex rounded-lg p-1">
          <button
            onClick={() => setPeriod("MONTHLY")}
            className={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
              period === "MONTHLY"
                ? "bg-background shadow"
                : "hover:bg-background/50"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod("YEARLY")}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              period === "YEARLY"
                ? "bg-background shadow"
                : "hover:bg-background/50"
            }`}
          >
            Yearly
            <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs">
              Save ~25%
            </span>
          </button>
        </div>
      </div>
      <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-2">
          <PlanCard
            plan={{
              id: "free",
              storageGB: FREE_SPACE_AVAILABLE / 1000 / 1000 / 1000,
              prices: [],
              free: true,
            }}
            period={period}
            currency={currency}
          />
        </div>
        {plans
          .filter((plan) => !plan.group)
          .map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              period={period}
              currency={currency}
            />
          ))}
        {groupPlan && (
          <div className="sm:col-span-2 lg:col-span-2">
            <PlanCard
              plan={groupPlan}
              period={period}
              currency={currency}
              groupIndex={groupIndex}
              setGroupIndex={setGroupIndex}
              maxGroupIndex={groupPlans.length - 1}
            />
          </div>
        )}
      </div>
    </div>
  );
}

type PlanCardProps = {
  plan: Plan & { free?: boolean };
  period: BillingPeriod;
  currency: string;
  groupIndex?: number;
  setGroupIndex?: (index: number) => void;
  maxGroupIndex?: number;
};

function PlanCard({
  plan,
  period,
  currency,
  groupIndex,
  setGroupIndex,
  maxGroupIndex,
}: PlanCardProps) {
  const [contact, setContact] = useState(false);

  const { price, savings, monthlyAmount } = usePlanPrices(
    plan,
    period,
    currency,
  );

  if (!price && !plan.free) return null;
  return (
    <div className="bg-card text-card-foreground relative flex flex-col justify-between rounded-xl border p-6">
      <div className="flex flex-col">
        {!contact ? (
          <>
            <div className="flex items-center justify-center gap-2 xl:gap-3">
              {setGroupIndex ? (
                <button
                  onClick={() => setGroupIndex((groupIndex || 0) - 1)}
                  disabled={groupIndex === 0}
                  className="bg-secondary hover:bg-secondary/80 border-border flex size-6 items-center justify-center rounded-md border disabled:opacity-50"
                >
                  <MinusIcon className="size-4" />
                </button>
              ) : null}
              <p className="text-center text-3xl font-bold">
                {plan.storageGB.toLocaleString()} GB
              </p>
              {setGroupIndex ? (
                <button
                  onClick={() =>
                    groupIndex === maxGroupIndex
                      ? setContact(true)
                      : setGroupIndex((groupIndex || 0) + 1)
                  }
                  disabled={contact}
                  className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md disabled:opacity-50"
                >
                  <PlusIcon className="size-4" />
                </button>
              ) : null}
            </div>
            {!contact ? (
              <p className="text-muted-foreground mt-1 text-center text-xs">
                Enjoy {plan.storageGB.toLocaleString()} GB of cloud storage
              </p>
            ) : null}
          </>
        ) : (
          <button
            onClick={() => setContact(false)}
            className="bg-secondary hover:bg-secondary/80 border-border inline-flex h-8 items-center justify-center gap-2 rounded-md border px-3 text-sm"
          >
            <ArrowLeftIcon className="size-4" />
            Go Back
          </button>
        )}
      </div>
      {!contact ? (
        <div className="mt-3 flex h-20 flex-col items-start justify-center">
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
            <>
              {(monthlyAmount || 0).toLocaleString(undefined, {
                style: "currency",
                minimumFractionDigits: 0,
                currency,
              })}
              <span key={1} className="text-sm font-normal">
                /month
              </span>
            </>
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
        <div className="my-4">
          <p className="text-lg font-semibold tracking-tight">
            Looking for more storage?
          </p>
          <p className="text-muted-foreground text-sm">
            Feel free to contact us at cloud@blinkdisk.com for a quote.
          </p>
        </div>
      )}
      {contact ? (
        <button
          onClick={() => window.open("mailto:cloud@blinkdisk.com")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors"
        >
          Contact Us
        </button>
      ) : null}
    </div>
  );
}
