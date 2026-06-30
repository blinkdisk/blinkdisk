import {
  type PolicySearch,
  type PolicyTarget,
  policyTargetFromSearch,
  policyTargetToSearch,
} from "@desktop/lib/policy-target";
import { PoliciesPage } from "@desktop/routes/$accountId/$vaultId/policies/policies-page";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ZPolicySearch = z
  .object({
    kind: z
      .enum([
        "GLOBAL",
        "HOST",
        "USER",
        "SOURCE",
        "DRAFT_SOURCE",
        "FOLDER",
        "DRAFT_FOLDER",
      ])
      .optional(),
    hostName: z.string().optional(),
    userName: z.string().optional(),
    policyPath: z.string().optional(),
  })
  .transform(
    (search): PolicySearch => ({
      ...search,
      kind:
        search.kind === "FOLDER"
          ? "SOURCE"
          : search.kind === "DRAFT_FOLDER"
            ? "DRAFT_SOURCE"
            : search.kind,
    }),
  );

export const Route = createFileRoute("/$accountId/$vaultId/policies")({
  validateSearch: ZPolicySearch,
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const selectedTarget = policyTargetFromSearch(search);

  const selectTarget = (target: PolicyTarget) =>
    navigate({
      search: policyTargetToSearch(target),
    });

  return (
    <PoliciesPage
      selectedTarget={selectedTarget}
      onSelectTarget={selectTarget}
    />
  );
}
