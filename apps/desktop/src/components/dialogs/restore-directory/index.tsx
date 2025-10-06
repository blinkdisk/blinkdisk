import { useRestoreDirectoryForm } from "@desktop/hooks/forms/use-restore-directory-form";
import { useDirectoryEmpty } from "@desktop/hooks/queries/use-directory-empty";
import { useRestoreDirectoryDialog } from "@desktop/hooks/state/use-restore-directory-dialog";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui/dialog";
import { AlertTriangleIcon } from "lucide-react";

export function RestoreDirectoryDialog() {
  const { t } = useAppTranslation("directory.restoreDialog");
  const { isOpen, setIsOpen, options } = useRestoreDirectoryDialog();

  const form = useRestoreDirectoryForm({
    objectId: options?.directoryId,
    onSuccess: () => {
      setIsOpen(false);
    },
  });

  const values = useStore(form.store, (state) => state.values);
  const errors = useStore(form.store, (state) => state.errorMap);

  const { data: isEmpty } = useDirectoryEmpty(
    "directoryPath" in values ? values.directoryPath : undefined,
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-fit">
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("description")}
        </DialogDescription>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
          className="w-100 mt-6 flex flex-col gap-4"
        >
          <form.AppField name="type">
            {(field) => (
              <field.Tabs
                label={{ title: t("type.label"), required: true }}
                className="w-full"
                items={[
                  {
                    value: "UNPACKED",
                    label: t("type.items.UNPACKED"),
                  },
                  {
                    value: "ZIP",
                    label: t("type.items.ZIP"),
                  },
                ]}
                onValueChange={(to) => {
                  if (to === "UNPACKED") {
                    form.resetField("filePath");
                  } else {
                    form.resetField("directoryPath");
                  }
                }}
              />
            )}
          </form.AppField>
          {values.type === "UNPACKED" ? (
            <>
              <form.AppField name="directoryPath">
                {(field) => (
                  <field.Path
                    label={{ title: t("directoryPath.label"), required: true }}
                    placeholder={t("directoryPath.placeholder")}
                    title={t("directoryPath.placeholder")}
                    type="directory"
                  />
                )}
              </form.AppField>
              {isEmpty === false ? (
                <>
                  <Alert variant="warn">
                    <AlertTriangleIcon />
                    <AlertTitle>{t("warning.title")}</AlertTitle>
                    <AlertDescription className="text-xs">
                      {t("warning.description")}
                    </AlertDescription>
                  </Alert>

                  <form.AppField name="confirmed">
                    {(field) => (
                      <field.Checkbox
                        label={{
                          title: t("confirmed.label"),
                          required: true,
                          errors:
                            errors.onSubmit &&
                            errors.onSubmit.code === "CONFIRMATION_REQUIRED"
                              ? [
                                  {
                                    type: "restore_confirmation",
                                    code: "required",
                                  },
                                ]
                              : undefined,
                        }}
                      />
                    )}
                  </form.AppField>
                </>
              ) : null}
            </>
          ) : (
            <>
              <form.AppField name="filePath">
                {(field) => (
                  <field.Path
                    label={{ title: t("filePath.label"), required: true }}
                    placeholder={t("filePath.placeholder")}
                    title={t("filePath.placeholder")}
                    defaultFileName={t("filePath.defaultFileName", {
                      directory:
                        (options && options.path && options?.path.length
                          ? options.path.at(-1)?.name
                          : undefined) ||
                        options?.folder?.name ||
                        "Folder",
                      date:
                        options && options.backup && options.backup.startTime
                          ? new Date(options.backup.startTime)
                              .toLocaleDateString()
                              .replace(/\//g, ".")
                          : "Unknown",
                    })}
                    mode="save"
                    type="file"
                  />
                )}
              </form.AppField>
              <form.AppField name="compress">
                {(field) => (
                  <field.Switch
                    label={{
                      title: t("compress.label"),
                      description: t("compress.description"),
                    }}
                  />
                )}
              </form.AppField>
            </>
          )}
          <form.AppForm>
            <form.Submit className="mt-4">{t("submit")}</form.Submit>
          </form.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
}
