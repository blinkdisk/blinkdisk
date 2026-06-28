import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const ZPolicySearch = z.object({
  kind: z.enum(["GLOBAL", "HOST", "USER", "FOLDER", "DRAFT_FOLDER"]).optional(),
  hostName: z.string().optional(),
  userName: z.string().optional(),
  policyPath: z.string().optional(),
});

export const Route = createFileRoute(
  "/$accountId/$vaultId/$hostName/$userName/settings/policies",
)({
  validateSearch: ZPolicySearch,
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/$accountId/$vaultId/$hostName/$userName/policies",
      from: "/$accountId/$vaultId/$hostName/$userName/settings/policies",
      search,
    });
  },
});
