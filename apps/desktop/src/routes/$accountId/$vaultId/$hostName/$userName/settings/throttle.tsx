import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/$accountId/$vaultId/$hostName/$userName/settings/throttle",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/$accountId/$vaultId/$hostName/$userName/settings",
      params,
    });
  },
});
