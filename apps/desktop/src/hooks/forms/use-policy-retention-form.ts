import { PolicyCategoryProps } from "@desktop/components/policy/category";
import { useUpdateFolderPolicy } from "@desktop/hooks/mutations/core/use-update-folder-policy";
import { useUpdateVaultPolicy } from "@desktop/hooks/mutations/core/use-update-vault-policy";
import { useFolderPolicy } from "@desktop/hooks/queries/core/use-folder-policy";
import { useVaultPolicy } from "@desktop/hooks/queries/core/use-vault-policy";
import { useAppForm } from "@hooks/use-app-form";
import { ZRetentionPolicy, ZRetentionPolicyType } from "@schemas/policy";
import { useMemo } from "react";

export function usePolicyRetentionForm({
  level,
  folderId,
  mock,
}: PolicyCategoryProps) {
  const { data: vaultPolicy } = useVaultPolicy();
  const { data: folderPolicy } = useFolderPolicy({ folderId, mock });

  function reset() {
    form.reset();
  }

  const { mutateAsync: mutateVault } = useUpdateVaultPolicy({
    onSuccess: reset,
  });

  const { mutateAsync: mutateFolder } = useUpdateFolderPolicy({
    mock,
    folderId,
    onSuccess: reset,
  });

  const policy = useMemo(
    () => (level === "FOLDER" ? folderPolicy : vaultPolicy),
    [folderPolicy, vaultPolicy, level],
  );

  const mutate = useMemo(
    () => (level === "FOLDER" ? mutateFolder : mutateVault),
    [mutateFolder, mutateVault, level],
  );

  const form = useAppForm({
    defaultValues: policy?.retention as ZRetentionPolicyType,
    validators: {
      onSubmit: ZRetentionPolicy,
    },
    onSubmit: async ({ value }) =>
      policy &&
      (await mutate({
        ...policy,
        retention: value,
      })),
  });

  return form;
}
