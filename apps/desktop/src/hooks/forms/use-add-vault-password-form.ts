import { useAddVaultPassword } from "@desktop/hooks/mutations/use-add-vault-password";
import { trpc } from "@desktop/lib/trpc";
import { useAppForm } from "@hooks/use-app-form";
import { ZVaultPasswordForm } from "@schemas/vault";

export function useAddVaultPasswordForm({
  vaultId,
  onSuccess,
}: {
  vaultId: string | undefined;
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
        // We to check the password is valid at this point to prevent
        // the config from being encrypted with a different password.

        const configs = await trpc.config.list.query({});

        // Find any config that is connected to this vault, it doesn't have
        // to be the exact userName or hostName as all share the same password.
        const config = configs.find((config) => config.vaultId === vaultId);

        if (!config) return;

        try {
          await window.electron.vault.config.decrypt({
            password: value.password,
            encrypted: config.data,
          });
        } catch {
          return { code: "INVALID_PASSWORD" };
        }
      },
    },
    onSubmit: async ({ value }) =>
      vaultId && (await mutateAsync({ ...value, vaultId })),
  });

  return form;
}
