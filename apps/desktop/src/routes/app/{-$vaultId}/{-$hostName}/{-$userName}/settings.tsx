import { PolicyContextProvider } from "@desktop/components/policy/context";
import { FilesSettings } from "@desktop/components/policy/files";
import { RetentionSettings } from "@desktop/components/policy/retention";
import { ScheduleSettings } from "@desktop/components/policy/schedule";
import { VaultConfigSettings } from "@desktop/components/vaults/settings/config";
import { VaultGeneralSettings } from "@desktop/components/vaults/settings/general";
import { VaultThrottleSettings } from "@desktop/components/vaults/settings/throttle";
import { VaultTitlebar } from "@desktop/components/vaults/titlebar";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useAppTranslation } from "@hooks/use-app-translation";
import { createFileRoute } from "@tanstack/react-router";
import { Accordion } from "@ui/accordion";
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
import { HomeIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute(
  "/app/{-$vaultId}/{-$hostName}/{-$userName}/settings",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("settings.vault");
  const { data: vault } = useVault();

  const [open, setOpen] = useState<string[]>([]);

  return (
    <div className="flex min-h-full flex-col overflow-x-hidden p-6">
      <VaultTitlebar
        vault={vault}
        breadcrumbs={
          !vault
            ? [undefined]
            : [
                {
                  id: "settings",
                  text: t("title"),
                },
              ]
        }
      >
        {vault ? (
          <Button
            as="link"
            href="/app/{-$vaultId}/{-$hostName}/{-$userName}"
            variant="outline"
            size="sm"
          >
            <HomeIcon />
            {t("home")}
          </Button>
        ) : (
          <Skeleton height="2.25rem" width="7rem" />
        )}
      </VaultTitlebar>
      <div className="mt-auto"></div>
      <div className="lg:w-130 mx-auto w-full">
        <PolicyContextProvider level="VAULT">
          {({ loading }) => (
            <Accordion
              type="multiple"
              value={loading ? [] : open}
              onValueChange={setOpen}
            >
              <VaultGeneralSettings />
              <VaultConfigSettings />
              <ScheduleSettings />
              <RetentionSettings />
              <FilesSettings />
              <VaultThrottleSettings />
            </Accordion>
          )}
        </PolicyContextProvider>
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
