import { useAppForm } from "@hooks/use-app-form";
import { ZVaultPasswordForm, ZVaultPasswordFormType } from "@schemas/vault";
import { useVaultPassword } from "../queries/use-vault-password";

export function useSetupPasswordForm({
  vaultId,
  onSubmit,
}: {
  vaultId: string | undefined;
  onSubmit?: (data: { value: ZVaultPasswordFormType }) => void;
}) {
  const { data: password } = useVaultPassword(vaultId ? { id: vaultId } : null);

  const form = useAppForm({
    defaultValues: {
      password: password || "",
    },
    validators: {
      onSubmit: ZVaultPasswordForm,
    },
    onSubmit,
  });

  return form;
}
