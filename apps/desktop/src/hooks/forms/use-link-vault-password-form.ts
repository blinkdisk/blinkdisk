import { useAppForm } from "@hooks/use-app-form";
import { ZLinkVaultPassword, ZLinkVaultPasswordType } from "@schemas/vault";

export function useLinkVaultPasswordForm({
  passwordHash,
  onSubmit,
}: {
  passwordHash: string | undefined;
  onSubmit?: (values: ZLinkVaultPasswordType) => void;
}) {
  const form = useAppForm({
    defaultValues: {
      password: "",
    },
    validators: {
      onSubmit: ZLinkVaultPassword,
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
    onSubmit: async ({ value }) => {
      onSubmit?.(value);
    },
  });

  return form;
}
