import { useFolderPolicy } from "@desktop/hooks/queries/core/use-folder-policy";
import { useVaultPolicy } from "@desktop/hooks/queries/core/use-vault-policy";
import { getFolderPolicyChanges } from "@desktop/lib/policy";
import { useMemo } from "react";

export function usePolicyChanges({ folderId }: { folderId?: string }) {
  const { data: vaultPolicy } = useVaultPolicy();
  const { data: folderPolicy } = useFolderPolicy({ folderId });

  return useMemo(
    () =>
      vaultPolicy &&
      folderPolicy &&
      getFolderPolicyChanges(vaultPolicy, folderPolicy),
    [vaultPolicy, folderPolicy],
  );
}
