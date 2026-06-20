import { Accordion } from "@blinkdisk/ui/accordion";
import { CompressionSettings } from "@desktop/components/policy/compression";
import { PolicyContextProvider } from "@desktop/components/policy/context";
import { FilesSettings } from "@desktop/components/policy/files";
import { RetentionSettings } from "@desktop/components/policy/retention";
import { ScheduleSettings } from "@desktop/components/policy/schedule";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/settings/policies",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = useState<string[]>([]);

  return (
    <PolicyContextProvider level="VAULT">
      {({ loading }) => (
        <Accordion value={loading ? [] : open} onValueChange={setOpen} multiple>
          <ScheduleSettings />
          <RetentionSettings />
          <FilesSettings />
          <CompressionSettings />
        </Accordion>
      )}
    </PolicyContextProvider>
  );
}
