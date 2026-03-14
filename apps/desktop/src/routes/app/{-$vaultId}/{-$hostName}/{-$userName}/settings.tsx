import { CompressionSettings } from "#components/policy/compression";
import { PolicyContextProvider } from "#components/policy/context";
import { FilesSettings } from "#components/policy/files";
import { RetentionSettings } from "#components/policy/retention";
import { ScheduleSettings } from "#components/policy/schedule";
import { VaultConfigSettings } from "#components/vaults/settings/config";
import { VaultGeneralSettings } from "#components/vaults/settings/general";
import { VaultThrottleSettings } from "#components/vaults/settings/throttle";
import { VaultTitlebar } from "#components/vaults/titlebar";
import { useVault } from "#hooks/queries/use-vault";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion } from "@blinkdisk/ui/accordion";
import { Button } from "@blinkdisk/ui/button";
import { Skeleton } from "@blinkdisk/ui/skeleton";
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
            render={<Link to="/app/{-$vaultId}/{-$hostName}/{-$userName}" />}
            nativeButton={false}
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
              value={loading ? [] : open}
              onValueChange={setOpen}
              multiple
            >
              <VaultGeneralSettings />
              <VaultConfigSettings />
              <ScheduleSettings />
              <RetentionSettings />
              <FilesSettings />
              <CompressionSettings />
              <VaultThrottleSettings />
            </Accordion>
          )}
        </PolicyContextProvider>
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
