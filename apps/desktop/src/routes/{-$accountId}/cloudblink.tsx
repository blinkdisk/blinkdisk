import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { SUBSCRIPTION_PLANS } from "@blinkdisk/constants/plans";
import { TRIAL_DAYS, TRIAL_STORAGE } from "@blinkdisk/constants/space";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import { Progress } from "@blinkdisk/ui/progress";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { cn } from "@blinkdisk/utils/class";
import { getErrorCode } from "@blinkdisk/utils/error";
import {
  SettingsGroup,
  SettingsPanel,
  SettingsRow,
} from "@desktop/components/settings";
import { SubscriptionPlans } from "@desktop/components/subscriptions/plans";
import { useOpenBillingPortal } from "@desktop/hooks/mutations/use-open-billing-portal";
import { useBilling } from "@desktop/hooks/queries/use-billing";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { useSubscription } from "@desktop/hooks/queries/use-subscription";
import { useCreateVaultDialog } from "@desktop/hooks/state/use-create-vault-dialog";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useRelativeTime } from "@desktop/hooks/use-relative-time";
import { formatSize } from "@desktop/lib/number";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  CircleAlertIcon,
  ExternalLinkIcon,
  PlusIcon,
  RefreshCwIcon,
} from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useEffect, useMemo } from "react";

export const Route = createFileRoute("/{-$accountId}/cloudblink")({
  beforeLoad: ({ params }) => {
    if (params.accountId === LOCAL_ACCOUNT_ID)
      throw redirect({
        to: "/{-$accountId}",
        params: { accountId: params.accountId },
      });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("cloudblink.page");
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();

  const { error, isFetching } = useSpace();
  const noSpace = getErrorCode(error) === "SPACE_NOT_FOUND";

  useEffect(() => {
    posthog.capture("cloudblink_page_show");
    queryClient.invalidateQueries({ queryKey: queryKeys.space });
  }, [posthog, queryClient, queryKeys.space]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.space });
    queryClient.invalidateQueries({
      queryKey: queryKeys.subscription.detail(),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.billing.detail() });
  };

  return (
    <div className="flex min-h-full flex-col overflow-y-auto px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-normal">
            {t("title")}
          </h1>
          <Button
            variant="secondary"
            size="icon"
            aria-label={t("refresh")}
            onClick={refresh}
            disabled={isFetching}
          >
            <RefreshCwIcon
              className={cn("size-4", isFetching && "animate-spin")}
            />
          </Button>
        </div>

        {noSpace ? (
          <StartTrialSection />
        ) : (
          <>
            <StorageSection />
            <PlanSection />
            <BillingSection />
          </>
        )}

        <PlansSection />
      </div>
    </div>
  );
}

function StartTrialSection() {
  const { t } = useAppTranslation("cloudblink.page.empty");
  const { openCreateVault } = useCreateVaultDialog();

  return (
    <SettingsPanel>
      <SettingsRow
        title={t("title")}
        titleClassName="text-lg font-semibold"
        description={t("description", {
          storage: formatSize(TRIAL_STORAGE),
          days: TRIAL_DAYS,
        })}
      >
        <Button
          onClick={() =>
            openCreateVault({
              step: "DETAILS",
              provider: "CLOUDBLINK",
              autoSelectedProvider: true,
            })
          }
          className="w-fit"
        >
          <PlusIcon />
          {t("button")}
        </Button>
      </SettingsRow>
    </SettingsPanel>
  );
}

function StorageSection() {
  const { t } = useAppTranslation("cloudblink.page.storage");
  const { data: space, isLoading } = useSpace();

  const storagePercentage = useMemo(() => {
    if (!space) return null;
    if (space.capacity === 0) return 1;
    return Math.min(space.used / space.capacity, 1);
  }, [space]);

  const hasData = !isLoading && !!space;

  return (
    <SettingsGroup title={t("title")}>
      <SettingsPanel>
        <SettingsRow fullWidth>
          {hasData ? (
            <div className="flex flex-col gap-3 py-1">
              <div className="flex items-center justify-between gap-4">
                <p className="text-base font-medium">
                  {t("used", {
                    // Show 0B used if less than 20kb. Users were confused that
                    // there was already space used after creating an empty vault.
                    used: formatSize(space.used < 20000 ? 0 : space.used),
                    capacity: formatSize(space.capacity),
                  })}
                </p>
                <p
                  className={cn(
                    "text-sm",
                    (storagePercentage || 0) >= 0.9
                      ? "text-destructive"
                      : (storagePercentage || 0) >= 0.8
                        ? "text-orange-600"
                        : (storagePercentage || 0) >= 0.7
                          ? "text-amber-600"
                          : "text-muted-foreground",
                  )}
                >
                  {(storagePercentage || 0).toLocaleString(undefined, {
                    style: "percent",
                  })}
                </p>
              </div>
              <Progress
                value={100 * (storagePercentage || 0)}
                className={cn(
                  "[&_[data-slot=progress-track]]:h-2",
                  (storagePercentage || 0) >= 0.9
                    ? "[&_[data-slot=progress-indicator]]:bg-destructive"
                    : (storagePercentage || 0) >= 0.8
                      ? "[&_[data-slot=progress-indicator]]:bg-orange-600"
                      : (storagePercentage || 0) >= 0.7
                        ? "[&_[data-slot=progress-indicator]]:bg-amber-600"
                        : "",
                )}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-1">
              <div className="flex items-center justify-between gap-4">
                <Skeleton width={160} />
                <Skeleton width={40} />
              </div>
              <Skeleton height={8} />
            </div>
          )}
        </SettingsRow>
        {hasData && space.capacity === 0 ? (
          <SettingsRow fullWidth>
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>{t("full.title")}</AlertTitle>
              <AlertDescription>{t("full.description")}</AlertDescription>
            </Alert>
          </SettingsRow>
        ) : null}
      </SettingsPanel>
    </SettingsGroup>
  );
}

function PlanSection() {
  const { t } = useAppTranslation("cloudblink.page.plan");
  const { data: space, isLoading: isSpaceLoading } = useSpace();
  const { data: subscription, isLoading: isSubscriptionLoading } =
    useSubscription();

  const plan = useMemo(
    () => SUBSCRIPTION_PLANS.find((p) => p.id === subscription?.planId),
    [subscription],
  );

  const price = useMemo(
    () => plan?.prices.find((p) => p.id === subscription?.priceId),
    [plan, subscription],
  );

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
          <SettingsRow
            title={t("current", {
              storageGB: plan.storageGB.toLocaleString(),
              period: t(`period.${price.period.toLowerCase()}`),
            })}
            description={t(`amount.${price.period.toLowerCase()}`, {
              amount: price.amount.toLocaleString(undefined, {
                style: "currency",
                minimumFractionDigits: 0,
                currency: price.currency,
              }),
            })}
          >
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

function BillingSection() {
  const { t } = useAppTranslation("cloudblink.page.billing");
  const { data: billing } = useBilling();
  const { mutate: openPortal, isPending } = useOpenBillingPortal();

  if (!billing?.portalEnabled) return null;

  return (
    <SettingsGroup title={t("title")}>
      <SettingsPanel>
        <SettingsRow
          title={t("portal.title")}
          description={t("portal.description")}
        >
          <Button
            variant="secondary"
            onClick={() => openPortal()}
            loading={isPending}
            className="w-fit"
          >
            <ExternalLinkIcon />
            {t("portal.button")}
          </Button>
        </SettingsRow>
      </SettingsPanel>
    </SettingsGroup>
  );
}

function PlansSection() {
  const { t } = useAppTranslation("cloudblink.page.plans");

  return (
    <section>
      <SubscriptionPlans
        header={<h2 className="text-xl font-semibold">{t("title")}</h2>}
        plansClassName="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2"
        cardClassName="w-full"
      />
    </section>
  );
}
