import { useEditBackup } from "@desktop/hooks/mutations/core/use-edit-backup";
import { useAppForm } from "@hooks/use-app-form";
import { z } from "zod";

const ZRenameBackup = z.object({
  name: z.string(),
});

export function useRenameBackupForm({
  backupId,
  currentName,
  onSuccess,
}: {
  backupId: string | undefined;
  currentName: string;
  onSuccess?: () => void;
}) {
  const { mutateAsync } = useEditBackup({ onSuccess });

  const form = useAppForm({
    defaultValues: {
      name: currentName,
    },
    validators: {
      onSubmit: ZRenameBackup,
    },
    onSubmit: async ({ value }) => {
      if (!backupId) return;
      await mutateAsync({
        backupId,
        description: value.name,
      });
    },
  });

  return form;
}
