import { BillingPeriod, Plan as PlanType, plans } from "@config/plans";
import { PendingCheckoutDialog } from "@desktop/components/dialogs/pending-checkout";
import {
  PlanChangeAction,
  PlanChangeDialog,
} from "@desktop/components/dialogs/plan-change";
import { useCheckout } from "@desktop/hooks/mutations/use-checkout";
import { useOpenBillingPortal } from "@desktop/hooks/mutations/use-open-billing-portal";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { useSubscription } from "@desktop/hooks/queries/use-subscription";
import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import { usePlanPrices } from "@hooks/use-plan-prices";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { ArrowLeftIcon, InfoIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Trans } from "react-i18next";

const currency = "USD";

type Change = {
  priceId: string;
  action: PlanChangeAction;
};

export function UpgradeDialog() {
  const { t } = useAppTranslation("subscription.upgradeDialog");
  const { isOpen, setIsOpen } = useUpgradeDialog();

  useSubscription({
    refetchInterval: isOpen ? 5000 : undefined,
  });

  const [groupIndex, setGroupIndex] = useState(0);
  const [period, setPeriod] = useState<BillingPeriod>("YEARLY");
  const [pending, setPending] = useState<{ url: string } | null>(null);

  const [changeOpen, setChangeOpen] = useState(false);
  const [change, setChange] = useState<Change | null>(null);

  const groupPlans = useMemo(() => plans.filter((plan) => plan.group), []);
  const groupPlan = useMemo(
    () => groupPlans[groupIndex],
    [groupPlans, groupIndex],
  );

  useEffect(() => {
    if (!isOpen) {
      setPending(null);
      setChangeOpen(false);
    }
  }, [isOpen]);

  return (
    <>
      <PendingCheckoutDialog
        isOpen={!!pending}
        setIsOpen={() => setPending(null)}
        url={pending?.url}
      />

      <PlanChangeDialog
        isOpen={changeOpen}
        setIsOpen={setChangeOpen}
        priceId={change?.priceId}
        action={change?.action}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="block max-h-[80vh] w-fit max-w-[95vw]"
          showCloseButton={false}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
              <DialogDescription className="text-sm">
                <InfoIcon className="-mt-0.5 mr-2 inline-block size-4" />
                {t("description")}
              </DialogDescription>
            </div>
            <Tabs
              value={period}
              onValueChange={(to) => setPeriod(to as BillingPeriod)}
            >
              <TabsList>
                <TabsTrigger className="px-6" value="MONTHLY">
                  {t("period.monthly")}
                </TabsTrigger>
                <TabsTrigger className="px-3" value="YEARLY">
                  {t("period.yearly")}
                  <Badge variant="subtle">{t("period.badge")}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="mt-8 flex gap-5">
            {plans
              .filter((plan) => !plan.group)
              .map((plan) => (
                <Plan
                  key={plan.id}
                  plan={plan}
                  period={period}
                  currency={currency}
                  setPending={(url) => setPending({ url })}
                  setChange={(change) => {
                    setChange(change);
                    setChangeOpen(true);
                  }}
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
                setPending={(url) => setPending({ url })}
                setChange={(change) => {
                  setChange(change);
                  setChangeOpen(true);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

type PlanProps = {
  plan: PlanType;
  period: BillingPeriod;
  currency: string;
  groupIndex?: number;
  setGroupIndex?: (index: number) => void;
  maxGroupIndex?: number;
  setPending: (url: string) => void;
  setChange: (change: Change) => void;
};

function Plan({
  plan,
  period,
  currency,
  groupIndex,
  setGroupIndex,
  maxGroupIndex,
  setPending,
  setChange,
}: PlanProps) {
  const { t } = useAppTranslation("subscription.upgradeDialog.plan");
  const [contact, setContact] = useState(false);

  const { data: subscription } = useSubscription();
  const { data: space } = useSpace();
  const { mutate: manage, isPending: isManagePending } = useOpenBillingPortal();

  const { mutate: checkout, isPending: isCheckoutPending } = useCheckout({
    onSuccess: ({ url }) => setPending(url),
  });

  const { price, savings, monthlyAmount } = usePlanPrices(
    plan,
    period,
    currency,
  );

  const action = useMemo(() => {
    const currentPlan = plans.find((p) => p.id === subscription?.planId);
    if (!currentPlan) return "UPGRADE";
    if (plan.id === currentPlan.id && price?.id === subscription?.priceId)
      return "MANAGE";

    if (plan.storageGB < currentPlan.storageGB) return "DOWNGRADE";
    if (plan.storageGB === currentPlan.storageGB) return "PERIOD_CHANGE";
    return "UPGRADE";
  }, [plan, price, subscription]);

  const isDowngradePossible = useMemo(() => {
    if (action !== "DOWNGRADE" || !space) return true;
    const bytes = plan.storageGB * 1000 * 1000 * 1000;
    return space.used < bytes;
  }, [plan, action, space]);

  if (!price) return null;
  return (
    <div className="bg-card text-card-foreground relative flex w-72 flex-col justify-between rounded-xl border p-6">
      {action === "MANAGE" ? (
        <div className="bg-background absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <Badge variant="subtle" className="px-3 text-sm">
            {t("current")}
          </Badge>
        </div>
      ) : null}
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
                {t("description", {
                  storageGB: plan.storageGB.toLocaleString(),
                })}
              </p>
            ) : null}
          </>
        ) : (
          <Button onClick={() => setContact(false)} variant="outline" size="sm">
            <ArrowLeftIcon className="size-4" />
            {t("contact.back")}
          </Button>
        )}
      </div>
      {!contact ? (
        <div className="my-3 flex h-20 flex-col items-start justify-center">
          {savings ? (
            <p className="text-muted-foreground text-sm line-through">
              {t("originalAmount", {
                original: savings.original?.toLocaleString(undefined, {
                  style: "currency",
                  minimumFractionDigits: 0,
                  currency,
                }),
              })}
            </p>
          ) : null}
          <p className="text-2xl font-semibold">
            <Trans
              i18nKey="subscription:upgradeDialog.plan.monthlyAmount"
              components={[<span key={1} className="text-sm font-normal" />]}
              values={{
                monthlyAmount: monthlyAmount?.toLocaleString(undefined, {
                  style: "currency",
                  minimumFractionDigits: 0,
                  currency,
                }),
              }}
            />
          </p>
          {savings ? (
            <p className="text-primary text-sm">
              {t("yearlySavings", {
                yearlySavings: savings.yearly?.toLocaleString(undefined, {
                  style: "currency",
                  minimumFractionDigits: 0,
                  currency,
                }),
              })}
            </p>
          ) : null}
        </div>
      ) : (
        <div>
          <p className="text-lg font-semibold tracking-tight">
            {t("contact.title")}
          </p>
          <p className="text-muted-foreground text-sm">
            {t("contact.description")}
          </p>
        </div>
      )}
      <div className="mt-2 [&>button]:w-full">
        {contact ? (
          <Button onClick={() => window.open("mailto:cloud@blinkdisk.com")}>
            {t("contact.button")}
          </Button>
        ) : action === "MANAGE" ? (
          <Button
            variant="outline"
            onClick={() => manage()}
            loading={isManagePending}
          >
            {t("manage")}
          </Button>
        ) : action === "UPGRADE" ? (
          <Button
            loading={isCheckoutPending}
            onClick={() =>
              subscription
                ? setChange({ action: "UPGRADE", priceId: price.id })
                : checkout({
                    priceId: price.id,
                  })
            }
          >
            {t("upgrade", {
              storageGB: plan.storageGB.toLocaleString(),
            })}
          </Button>
        ) : action === "DOWNGRADE" ? (
          <Button
            onClick={() => {
              setChange({
                action: "DOWNGRADE",
                priceId: price.id,
              });
            }}
            disabled={!isDowngradePossible}
            variant="outline"
          >
            {t(isDowngradePossible ? "downgrade" : "downgradeNotPossible", {
              storageGB: plan.storageGB.toLocaleString(),
            })}
          </Button>
        ) : (
          <Button
            onClick={() => {
              setChange({
                action: "PERIOD_CHANGE",
                priceId: price.id,
              });
            }}
            variant={period === "MONTHLY" ? "outline" : "default"}
          >
            {t("periodChange", {
              period: t(`period.${period.toLowerCase()}`),
            })}
          </Button>
        )}
      </div>
    </div>
  );
}
