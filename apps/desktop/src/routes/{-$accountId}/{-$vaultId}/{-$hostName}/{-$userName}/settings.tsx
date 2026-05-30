import { Accordion } from "@blinkdisk/ui/accordion";
import { CompressionSettings } from "@desktop/components/policy/compression";
import { PolicyContextProvider } from "@desktop/components/policy/context";
import { FilesSettings } from "@desktop/components/policy/files";
import { RetentionSettings } from "@desktop/components/policy/retention";
import { ScheduleSettings } from "@desktop/components/policy/schedule";
import { VaultConfigSettings } from "@desktop/components/vaults/settings/config";
import { VaultGeneralSettings } from "@desktop/components/vaults/settings/general";
import { VaultThrottleSettings } from "@desktop/components/vaults/settings/throttle";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/settings",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = useState<string[]>([]);

  return (
    <div className="flex min-h-full flex-col overflow-x-hidden p-6">
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
