import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { ZUpdateVaultForm } from "@blinkdisk/schemas/vault";
import { useUpdateVault } from "@desktop/hooks/mutations/use-update-vault";
import { useVault } from "@desktop/hooks/queries/use-vault";

export function useUpdateVaultForm() {
  const { data: vault } = useVault();
  const { mutateAsync } = useUpdateVault(() => form.reset());

  const form = useAppForm({
    defaultValues: {
      name: vault?.name || "",
    },
    validators: {
      onSubmit: ZUpdateVaultForm,
    },
    onSubmit: async ({ value }) => await mutateAsync(value),
  });

  return form;
}
