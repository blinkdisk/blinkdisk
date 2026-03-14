import { useUpdateVault } from "#hooks/mutations/use-update-vault";
import { useVault } from "#hooks/queries/use-vault";
import { useAppForm } from "@hooks/use-app-form";
import { ZUpdateVaultForm } from "@schemas/vault";

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
