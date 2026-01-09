import { useUpdateVault } from "@desktop/hooks/mutations/use-update-vault";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useAppForm } from "@hooks/use-app-form";
import { ZUpdateVaultForm } from "@schemas/vault";

export function useUpdateVaultForm() {
  const { data: vault } = useVault();
  console.log("Name", vault?.name);
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
