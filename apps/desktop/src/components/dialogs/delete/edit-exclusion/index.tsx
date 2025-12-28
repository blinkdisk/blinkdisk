import { useEditExclusionForm } from "@desktop/hooks/forms/use-edit-exclusion-form";
import { useEditExclusionDialog } from "@desktop/hooks/state/use-edit-exclusion-dialog";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";

export function EditExclusionDialog() {
  const { t } = useAppTranslation("policy.files.exclusions.dialog");
  const { isOpen, setIsOpen, options } = useEditExclusionDialog();

  const form = useEditExclusionForm(options?.initialValue, (rule) => {
    options?.onSave?.(rule);
    setIsOpen(false);
  });

  const values = useStore(form.store, (state) => state.values);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onClosed={() => form.reset()}
    >
      <DialogContent className="w-100">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
          className="mt-4 flex w-full flex-col gap-4"
        >
          <form.AppField name="type">
            {(field) => (
              <field.Tabs
                label={{ title: t("type.label") }}
                className="w-full"
                items={[
                  {
                    value: "NAME",
                    label: t("type.name"),
                  },
                  {
                    value: "EXTENSION",
                    label: t("type.extension"),
                  },
                ]}
                onValueChange={() => {
                  // Reset errors from fields that were unmounted
                  form.validateAllFields("change");
                }}
              />
            )}
          </form.AppField>

          {values.type === "NAME" ? (
            <>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{t("pattern.label")}</p>
                <div className="flex items-start gap-2">
                  <form.AppField name="matchType">
                    {(field) => (
                      <field.Select
                        label={{}}
                        placeholder={t("matchType.placeholder")}
                        triggerClassName="w-29"
                        items={[
                          {
                            value: "EXACT",
                            label: t("matchType.exact"),
                          },
                          {
                            value: "STARTS_WITH",
                            label: t("matchType.startsWith"),
                          },
                          {
                            value: "ENDS_WITH",
                            label: t("matchType.endsWith"),
                          },
                          {
                            value: "CONTAINS",
                            label: t("matchType.contains"),
                          },
                        ]}
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="pattern">
                    {(field) => (
                      <field.Text
                        label={{}}
                        placeholder={t("pattern.placeholder")}
                      />
                    )}
                  </form.AppField>
                </div>
              </div>

              <form.AppField name="foldersOnly">
                {(field) => (
                  <field.Switch
                    label={{
                      title: t("foldersOnly"),
                    }}
                  />
                )}
              </form.AppField>
            </>
          ) : values.type === "EXTENSION" ? (
            <form.AppField name="extension">
              {(field) => (
                <field.Text
                  label={{ title: t("extension.label") }}
                  placeholder={t("extension.placeholder")}
                />
              )}
            </form.AppField>
          ) : null}
          <form.AppForm>
            <form.Submit className="mt-2 w-full">{t("save")}</form.Submit>
          </form.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
}
