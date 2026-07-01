import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { getErrorCode } from "@blinkdisk/utils/error";
import { CloudBlinkLogo } from "@desktop/components/icons/cloudblink";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { PlanSection } from "@desktop/routes/$accountId/cloudblink/plan-section";
import { PlansSection } from "@desktop/routes/$accountId/cloudblink/plans-section";
import { StartTrialSection } from "@desktop/routes/$accountId/cloudblink/start-trial-section";
import { StorageSection } from "@desktop/routes/$accountId/cloudblink/storage-section";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ExternalLinkIcon, MailIcon } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export const Route = createFileRoute("/$accountId/cloudblink")({
  beforeLoad: ({ params }) => {
    if (params.accountId === LOCAL_ACCOUNT_ID)
      throw redirect({
        to: "/$accountId",
        from: "/$accountId/cloudblink",
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
      <div className="mx-auto flex w-full max-w-[41.5rem] flex-col gap-10">
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
