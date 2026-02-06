import { useAppForm } from "@hooks/use-app-form";
import { ZCreateFolderForm, ZCreateFolderFormType } from "@schemas/folder";

export function useCreateFolderForm({
  onSubmit,
  defaultValues,
}: {
  onSubmit?: ({ value }: { value: ZCreateFolderFormType }) => void;
  defaultValues?: Partial<ZCreateFolderFormType> | null;
}) {
  const form = useAppForm({
    defaultValues: {
      name: "",
      emoji: "📁",
      path: "",
      type: "folder" as const,
      ...(defaultValues || {}),
    },
    validators: {
      onSubmit: ZCreateFolderForm,
    },
    onSubmit,
  });

  return form;
}
