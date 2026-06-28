import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$accountId/$vaultId/settings/throttle")({
  beforeLoad: () => {
    throw redirect({
      to: "/$accountId/$vaultId/settings",
      from: "/$accountId/$vaultId/settings/throttle",
    });
  },
});
