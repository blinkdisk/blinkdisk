import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import {
  getRealPolicyUserName,
  type PolicyTarget,
} from "@desktop/lib/policy-target";

export function getPolicyTargetSource(
  target: PolicyTarget,
  sources: CoreSourceItem[] | null | undefined,
) {
  if (target.kind !== "SOURCE" && target.kind !== "DRAFT_SOURCE") {
    return undefined;
  }

  return sources?.find(
    (source) =>
      source.source.host === target.hostName &&
      getRealPolicyUserName(source.source.userName) === target.userName &&
      source.source.path === target.path,
  );
}
