import { useRestoreDirectory } from "@desktop/hooks/mutations/core/use-restore-directory";
import { useAppForm } from "@hooks/use-app-form";
import { ZRestoreDirectory, ZRestoreDirectoryType } from "@schemas/directory";

export function useRestoreDirectoryForm({
  objectId,
  onSuccess,
}: {
  objectId: string | undefined;
  onSuccess?: () => void;
}) {
  const { mutateAsync } = useRestoreDirectory({
    objectId,
    onSuccess: () => {
      form.reset();
      onSuccess?.();
    },
  });

  const form = useAppForm({
    defaultValues: {
      type: "UNPACKED",
      filePath: "",
      directoryPath: "",
      compress: false,
      confirmed: false,
    } as ZRestoreDirectoryType,
    validators: {
      onSubmit: ZRestoreDirectory,
      onSubmitAsync: async ({ value }) => {
        if (value.type === "UNPACKED") {
          const isEmpty = await window.electron.vault.restore.checkEmpty({
            directoryPath: "directoryPath" in value ? value.directoryPath : "",
          });

          if (!isEmpty && !value.confirmed)
            return {
              code: "CONFIRMATION_REQUIRED",
            };
        }
      },
    },
    onSubmit: async ({ value }) => await mutateAsync(value),
  });

  return form;
}
