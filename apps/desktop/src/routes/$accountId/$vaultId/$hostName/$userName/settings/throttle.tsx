import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/$accountId/$vaultId/$hostName/$userName/settings/throttle",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/$accountId/$vaultId/$hostName/$userName/settings",
      from: "/$accountId/$vaultId/$hostName/$userName/settings/throttle",
    });
  },
});
