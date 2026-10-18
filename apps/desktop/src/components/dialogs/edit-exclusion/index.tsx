import { useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { useEditExclusionForm } from "@desktop/hooks/forms/use-edit-exclusion-form";
import { useEditExclusionDialog } from "@desktop/hooks/state/use-edit-exclusion-dialog";
import {
  formatExclusionPath,
  formatRelativeExclusionPath,
  isInvalidNamePattern,
  looksLikePath,
  toExclusionPath,
} from "@desktop/lib/exclusion";
import { FileIcon, FolderIcon, InfoIcon } from "lucide-react";

export function EditExclusionDialog() {
  const { t } = useAppTranslation("policy.files.exclusions.dialog");
  const { isOpen, setIsOpen, options } = useEditExclusionDialog();
  const root = options?.root;

  const form = useEditExclusionForm(options?.initialValue, root, (rule) => {
    options?.onSave?.(rule);
    setIsOpen(false);
  });

  const values = useStore(form.store, (state) => state.values);
  const showPathType = !!root || values.type === "PATH";

  const validatePath = (value: string) => {
    const result = toExclusionPath(value, root);
    if (!("error" in result)) return undefined;

    return {
      message: t(`path.errors.${result.error}`, { root }),
      translated: true,
    };
  };

  const browse = async (kind: "folder" | "file") => {
    const current = values.type === "PATH" ? values.path : "";
    const resolved = toExclusionPath(current, root);

    const result = await window.electron.dialog.open({
      title: t(kind === "folder" ? "path.chooseFolder" : "path.chooseFile"),
      defaultPath:
        "path" in resolved ? formatExclusionPath(resolved.path, root) : root,
      properties:
        kind === "folder"
          ? ["openDirectory", "showHiddenFiles"]
          : ["openFile", "showHiddenFiles"],
    });

    const selected = result.filePaths[0];
    if (result.canceled || !selected) return;

    setPathAndValidate(selected);
  };

  const setPathAndValidate = (path: string) => {
    form.setFieldValue("path", path);
    form.setFieldMeta("path", (meta) => ({ ...meta, isBlurred: true }));
    form.validateField("path", "change");
  };

  const convertPatternToPath = async () => {
    if (values.type !== "NAME") return;

    const pattern = values.pattern;
    form.setFieldValue("type", "PATH");
    form.setFieldValue("pattern", "");
    await form.validateAllFields("change");
    setPathAndValidate(pattern);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onClosed={() => form.reset()}
    >
      <DialogContent className="w-110">
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
                  ...(showPathType
                    ? [
                        {
                          value: "PATH",
                          label: t("type.path"),
                        },
                      ]
                    : []),
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

          {values.type === "PATH" ? (
            <div className="flex flex-col gap-2">
              <form.AppField
                name="path"
                validators={{
                  // Only validate while typing once the user left the field,
                  // so partially typed paths don't show errors.
                  onChange: ({ value, fieldApi }) =>
                    fieldApi.state.meta.isBlurred
                      ? validatePath(value)
                      : undefined,
                  onSubmit: ({ value }) => validatePath(value),
                }}
                listeners={{
                  onBlur: ({ fieldApi }) => fieldApi.validate("change"),
                }}
              >
                {(field) => (
                  <field.Text
                    label={{
                      title: t("path.label"),
                      description: root
                        ? t("path.description", { root })
                        : t("path.descriptionWithoutRoot"),
                    }}
                    placeholder={
                      root
                        ? formatExclusionPath("/…", root)
                        : t("path.placeholderWithoutRoot")
                    }
                    spellCheck={false}
                  />
                )}
              </form.AppField>
              {options?.canBrowse ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => browse("folder")}
                  >
                    <FolderIcon />
                    {t("path.chooseFolder")}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => browse("file")}
                  >
                    <FileIcon />
                    {t("path.chooseFile")}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : values.type === "NAME" ? (
            <>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{t("pattern.label")}</p>
                <p className="text-muted-foreground mb-1 text-sm">
                  {t("pattern.description")}
                </p>
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

                  <form.AppField
                    name="pattern"
                    validators={{
                      onChange: ({ value }) =>
                        isInvalidNamePattern(value)
                          ? {
                              message: t("pattern.errors.path"),
                              translated: true,
                            }
                          : undefined,
                    }}
                  >
                    {(field) => (
                      <field.Text
                        label={{}}
                        placeholder={t("pattern.placeholder")}
                        spellCheck={false}
                      />
                    )}
                  </form.AppField>
                </div>
                {looksLikePath(values.pattern) ? (
                  <div className="bg-primary/5 border-primary/30 text-primary mt-2 flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm">
                    <InfoIcon className="mt-0.5 size-4 shrink-0" />
                    <div className="flex flex-col items-start gap-2">
                      <p>
                        {root
                          ? t("pattern.pathHint.withRoot")
                          : t("pattern.pathHint.withoutRoot")}
                      </p>
                      {root ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={convertPatternToPath}
                        >
                          {t("pattern.pathHint.action")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
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
          {values.type === "PATH" && root ? (
            <PathRulePreview path={values.path} root={root} />
          ) : null}
          <form.AppForm>
            <form.Submit className="mt-2 w-full">{t("save")}</form.Submit>
          </form.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PathRulePreview({ path, root }: { path: string; root: string }) {
  const { t } = useAppTranslation("policy.files.exclusions.dialog.path");
  const result = toExclusionPath(path, root);
  if ("error" in result) return null;

  return (
    <p className="text-muted-foreground text-xs">
      {t("preview", {
        path: formatRelativeExclusionPath(result.path, root),
      })}
    </p>
  );
}
