import { PolicyContext } from "@desktop/hooks/use-policy-context";
import { getFolderPolicyChanges } from "@desktop/lib/policy";
import { useMemo } from "react";

export function usePolicyChanges(context?: PolicyContext) {
  return useMemo(
    () =>
      context &&
      context.vaultPolicy &&
      context.folderPolicy &&
      getFolderPolicyChanges(context.vaultPolicy, context.folderPolicy),
    [context],
  );
}
