import { VaultGeneralSettings } from "@desktop/components/vaults/settings/general";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/$accountId/$vaultId/$hostName/$userName/settings",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-full flex-col overflow-y-auto px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-10">
        <VaultGeneralSettings />
      </div>
    </div>
  );
}
