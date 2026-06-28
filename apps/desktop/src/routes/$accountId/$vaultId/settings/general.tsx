import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$accountId/$vaultId/settings/general")({
  beforeLoad: () => {
    throw redirect({
      to: "/$accountId/$vaultId/settings",
      from: "/$accountId/$vaultId/settings/general",
    });
  },
});
