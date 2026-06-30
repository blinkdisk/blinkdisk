import { SUBSCRIPTION_PLANS } from "@blinkdisk/constants/plans";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import {
  SettingsGroup,
  SettingsPanel,
  SettingsRow,
} from "@desktop/components/settings";
import { useOpenBillingPortal } from "@desktop/hooks/mutations/use-open-billing-portal";
import { useBilling } from "@desktop/hooks/queries/use-billing";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { useSubscription } from "@desktop/hooks/queries/use-subscription";
import { useRelativeTime } from "@desktop/hooks/use-relative-time";
import { formatSize } from "@desktop/lib/number";
import { ExternalLinkIcon } from "lucide-react";

export function PlanSection() {
  const { t } = useAppTranslation("cloudblink.page.plan");
  const { t: billingT } = useAppTranslation("cloudblink.page.billing");
  const { data: space, isLoading: isSpaceLoading } = useSpace();
  const { data: subscription, isLoading: isSubscriptionLoading } =
    useSubscription();
  const { data: billing } = useBilling();
  const { mutate: openPortal, isPending } = useOpenBillingPortal();

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription?.planId);

  const price = plan?.prices.find((p) => p.id === subscription?.priceId);

  const trialEndsIn = useRelativeTime(space?.trialEndsAt);

  const isLoading = isSpaceLoading || isSubscriptionLoading;

  return (
    <SettingsGroup title={t("title")}>
      <SettingsPanel>
        {isLoading ? (
          <SettingsRow fullWidth>
            <div className="flex flex-col gap-2 py-1">
              <Skeleton width={160} />
              <Skeleton width={240} />
            </div>
          </SettingsRow>
        ) : subscription && plan && price ? (
          <SettingsRow fullWidth>
            <div className="flex flex-col gap-4 md:min-h-12 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-medium">
                    {t("current", {
                      storageGB: plan.storageGB.toLocaleString(),
                      period: t(`period.${price.period.toLowerCase()}`),
                    })}
                  </p>
                  <Badge
                    variant={
                      subscription.status === "ACTIVE" ||
                      subscription.status === "TRIALING"
                        ? "subtle"
                        : "destructive"
                    }
                  >
                    {t(`status.${subscription.status}`)}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                  {t(`amount.${price.period.toLowerCase()}`, {
                    amount: price.amount.toLocaleString(undefined, {
                      style: "currency",
                      minimumFractionDigits: 0,
                      currency: price.currency,
                    }),
                  })}
                </p>
              </div>
              {billing?.portalEnabled ? (
                <Button
                  variant="secondary"
                  onClick={() => openPortal()}
                  loading={isPending}
                  className="w-fit"
                >
                  <ExternalLinkIcon />
                  {billingT("portal.button")}
                </Button>
              ) : null}
            </div>
          </SettingsRow>
        ) : space?.trialEndsAt ? (
          <SettingsRow
            title={t("trial.title")}
            description={t("trial.description", {
              capacity: formatSize(space.capacity),
            })}
          >
            <Badge variant="subtle">{t("trial.endsIn", { trialEndsIn })}</Badge>
          </SettingsRow>
        ) : (
          <SettingsRow
            title={t("none.title")}
            description={t("none.description")}
          >
            {null}
          </SettingsRow>
        )}
      </SettingsPanel>
    </SettingsGroup>
  );
}
