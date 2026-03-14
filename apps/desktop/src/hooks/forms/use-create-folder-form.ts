import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZCreateFolderForm,
  ZCreateFolderFormType,
} from "@blinkdisk/schemas/folder";

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
      ...(defaultValues || {}),
    },
    validators: {
      onSubmit: ZCreateFolderForm,
    },
    onSubmit,
  });

  return form;
}
