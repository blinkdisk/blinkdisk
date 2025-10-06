import { useAppForm } from "@hooks/use-app-form";
import { ZCreateFolderForm, ZCreateFolderFormType } from "@schemas/folder";

export function useCreateFolderForm({
  onSubmit,
}: {
  onSubmit?: ({ value }: { value: ZCreateFolderFormType }) => void;
}) {
  const form = useAppForm({
    defaultValues: {
      name: "",
      emoji: "📁",
      path: "",
    },
    validators: {
      onSubmit: ZCreateFolderForm,
    },
    onSubmit,
  });

  return form;
}
