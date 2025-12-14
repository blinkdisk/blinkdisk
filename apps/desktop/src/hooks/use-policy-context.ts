import { useUpdateFolderPolicy } from "@desktop/hooks/mutations/core/use-update-folder-policy";
import { useUpdateVaultPolicy } from "@desktop/hooks/mutations/core/use-update-vault-policy";
import { useFolderPolicy } from "@desktop/hooks/queries/core/use-folder-policy";
import { useVaultPolicy } from "@desktop/hooks/queries/core/use-vault-policy";
import { ZPolicyLevelType } from "@schemas/policy";
import { useMemo } from "react";

export function usePolicyContext({
  level,
  folderId,
  mock,
}: {
  level: ZPolicyLevelType;
  folderId?: string;
  mock?: boolean;
}) {
  const { data: vaultPolicy } = useVaultPolicy();
  const { data: folderPolicy } = useFolderPolicy({ folderId, mock });

  const { mutateAsync: mutateVault } = useUpdateVaultPolicy();

  const { mutateAsync: mutateFolder } = useUpdateFolderPolicy({
    mock,
    folderId,
  });

  const policy = useMemo(
    () => (level === "FOLDER" ? folderPolicy : vaultPolicy),
    [folderPolicy, vaultPolicy, level],
  );

  const mutate = useMemo(
    () => (level === "FOLDER" ? mutateFolder : mutateVault),
    [mutateFolder, mutateVault, level],
  );

  return {
    vaultPolicy,
    folderPolicy,
    folderId,
    policy,
    mutate,
    level,
    mock,
  };
}

export type PolicyContext = ReturnType<typeof usePolicyContext>;
