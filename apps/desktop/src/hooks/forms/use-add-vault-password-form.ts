import { useAddVaultPassword } from "@desktop/hooks/mutations/use-add-vault-password";
import { useAppForm } from "@hooks/use-app-form";
import { ZVaultPasswordForm } from "@schemas/vault";

export function useAddVaultPasswordForm({
  passwordHash,
  storageId,
  onSuccess,
}: {
  passwordHash: string | undefined;
  storageId: string | undefined;
  onSuccess?: () => void;
}) {
  const { mutateAsync } = useAddVaultPassword(() => {
    form.reset();
    onSuccess?.();
  });

  const form = useAppForm({
    defaultValues: {
      password: "",
    },
    validators: {
      onSubmit: ZVaultPasswordForm,
      onSubmitAsync: async ({ value }) => {
        if (!passwordHash) return;

        const valid = await window.electron.vault.password.compare({
          password: value.password,
          hash: passwordHash,
        });

        if (!valid)
          return {
            code: "INVALID_PASSWORD",
          };
      },
    },
    onSubmit: async ({ value }) =>
      storageId && (await mutateAsync({ ...value, storageId })),
  });

  return form;
}
