import { useUpdateFolder } from "@desktop/hooks/mutations/use-update-folder";
import { useFolder } from "@desktop/hooks/use-folder";
import { useAppForm } from "@hooks/use-app-form";
import { ZUpdateFolderForm } from "@schemas/folder";

export function useUpdateFolderForm() {
  const { data: folder } = useFolder();
  const { mutateAsync } = useUpdateFolder(() => form.reset());

  const form = useAppForm({
    defaultValues: {
      name: folder?.name || "",
      emoji: folder?.emoji || "",
    },
    validators: {
      onSubmit: ZUpdateFolderForm,
    },
    onSubmit: async ({ value }) => await mutateAsync(value),
  });

  return form;
}
