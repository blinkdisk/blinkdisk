import { useUpdateFolderPolicy } from "@desktop/hooks/mutations/core/use-update-folder-policy";
import { useUpdateVaultPolicy } from "@desktop/hooks/mutations/core/use-update-vault-policy";
import { useFolderPolicy } from "@desktop/hooks/queries/core/use-folder-policy";
import { useVaultPolicy } from "@desktop/hooks/queries/core/use-vault-policy";
import { useAppForm } from "@hooks/use-app-form";
import {
  ZFilesPolicy,
  ZFilesPolicyType,
  ZPolicyLevelType,
} from "@schemas/policy";
import { useMemo } from "react";

export function usePolicyFilesForm(level: ZPolicyLevelType) {
  const { data: vaultPolicy } = useVaultPolicy();
  const { data: folderPolicy } = useFolderPolicy();

  function reset() {
    form.reset();
  }

  const { mutateAsync: mutateVault } = useUpdateVaultPolicy(reset);
  const { mutateAsync: mutateFolder } = useUpdateFolderPolicy(reset);

  const policy = useMemo(
    () => (level === "FOLDER" ? folderPolicy : vaultPolicy),
    [folderPolicy, vaultPolicy, level],
  );

  const mutate = useMemo(
    () => (level === "FOLDER" ? mutateFolder : mutateVault),
    [mutateFolder, mutateVault, level],
  );

  const form = useAppForm({
    defaultValues: policy?.files as ZFilesPolicyType,
    validators: {
      onSubmit: ZFilesPolicy,
    },
    onSubmit: async ({ value }) =>
      policy &&
      (await mutate({
        ...policy,
        files: value,
      })),
  });

  return form;
}
