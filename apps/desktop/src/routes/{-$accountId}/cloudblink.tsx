import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { SUBSCRIPTION_PLANS } from "@blinkdisk/constants/plans";
import {
  STORAGE_USAGE_CRITICAL_THRESHOLD,
  STORAGE_USAGE_WARNING_THRESHOLD,
  TRIAL_DAYS,
  TRIAL_STORAGE,
} from "@blinkdisk/constants/space";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { cn } from "@blinkdisk/utils/class";
import { getErrorCode } from "@blinkdisk/utils/error";
import { CloudBlinkLogo } from "@desktop/components/icons/cloudblink";
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
  MailIcon,
  PlusIcon,
} from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useEffect, useMemo } from "react";

const STORAGE_SEGMENT_COUNT = 28;
const STORAGE_SEGMENTS = Array.from(
  { length: STORAGE_SEGMENT_COUNT },
  (_, index) => index,
);

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

  const { error } = useSpace();
  const noSpace = getErrorCode(error) === "SPACE_NOT_FOUND";

  useEffect(() => {
    posthog.capture("cloudblink_page_show");
    queryClient.invalidateQueries({ queryKey: queryKeys.space });
  }, [posthog, queryClient, queryKeys.space]);

  return (
    <div className="flex min-h-full flex-col overflow-y-auto px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-10">
        <div className="flex items-center justify-between gap-4">
          <h1 aria-label={t("title")}>
            <CloudBlinkLogo className="text-foreground h-4.5 w-auto" />
          </h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground px-3"
              onClick={() => window.open("mailto:cloud@blinkdisk.com")}
            >
              <MailIcon />
              {t("contactUs")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-muted-foreground px-3"
              onClick={() =>
                window.open(
                  `${process.env.MARKETING_URL}/cloudblink?ref=desktop`,
                )
              }
            >
              <ExternalLinkIcon />
              {t("learnMore")}
            </Button>
          </div>
        </div>

        {noSpace ? (
          <StartTrialSection />
        ) : (
          <>
            <StorageSection />
            <PlanSection />
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
  const storageRatio = storagePercentage || 0;
  const storagePercent = Math.round(storageRatio * 100);
  const filledSegments = Math.round(storageRatio * STORAGE_SEGMENT_COUNT);
  const filledSegmentClassName =
    storageRatio >= STORAGE_USAGE_CRITICAL_THRESHOLD
      ? "bg-destructive"
      : storageRatio >= STORAGE_USAGE_WARNING_THRESHOLD
        ? "bg-amber-600 dark:bg-amber-500"
        : "bg-primary";

  if (!isLoading && !space) return null;

  return (
    <SettingsGroup title={t("title")}>
      <SettingsPanel>
        <SettingsRow fullWidth>
          {hasData ? (
            <div className="grid gap-5 py-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <p className="flex items-baseline gap-1">
                  <span className="text-[2.75rem] font-bold tabular-nums leading-none tracking-normal">
                    {storagePercent.toLocaleString()}
                  </span>
                  <span className="text-xl font-bold">%</span>
                  <span className="text-muted-foreground ml-1 text-sm font-medium">
                    {t("usedSuffix")}
                  </span>
                </p>
                <div className="tabular-nums sm:text-right">
                  <p className="text-foreground text-base font-semibold">
                    {
                      // Show 0B used if less than 20kb. Users were confused that
                      // there was already space used after creating an empty vault.
                      formatSize(space.used < 20000 ? 0 : space.used)
                    }
                  </p>
                  <p className="text-muted-foreground text-sm font-medium">
                    {t("ofCapacity", {
                      capacity: formatSize(space.capacity),
                    })}
                  </p>
                </div>
              </div>
              <div className="flex h-9 w-full gap-1 overflow-hidden">
                {STORAGE_SEGMENTS.map((segment) => (
                  <div
                    key={segment}
                    className={cn(
                      "h-full flex-1 rounded-[3px]",
                      segment < filledSegments
                        ? filledSegmentClassName
                        : "bg-gray-200 dark:bg-white/5",
                    )}
                  />
                ))}
              </div>
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
  const { t: billingT } = useAppTranslation("cloudblink.page.billing");
  const { data: space, isLoading: isSpaceLoading } = useSpace();
  const { data: subscription, isLoading: isSubscriptionLoading } =
    useSubscription();
  const { data: billing } = useBilling();
  const { mutate: openPortal, isPending } = useOpenBillingPortal();

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
