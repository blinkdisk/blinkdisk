import { DynamicField } from "@blinkdisk/components/dynamic-field";
import {
  FormDisabledContext,
  useFieldContext,
  useStore,
} from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { Input } from "@blinkdisk/ui/input";
import { SettingsCategory } from "@desktop/components/policy/category";
import { PolicyField } from "@desktop/components/policy/field";
import type { PolicyForm } from "@desktop/hooks/forms/use-policy-form";
import { useEditExclusionDialog } from "@desktop/hooks/state/use-edit-exclusion-dialog";
import { parseExclusionRule } from "@desktop/lib/exclusion";
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { use } from "react";

export function FilesSettings({
  form,
  showAdvanced = true,
}: {
  form: PolicyForm;
  showAdvanced?: boolean;
}) {
  const { t } = useAppTranslation("policy.files");

  return (
    <SettingsCategory
      id="files"
      title={t("title")}
      description={t("description")}
    >
      <div className="flex flex-col gap-4">
        <form.AppField name="files.excludeCacheDirs">
          {(field) => (
            <PolicyField>
              <field.Switch
                label={{
                  title: t("excludeCacheDirs.label"),
                  description: t("excludeCacheDirs.description"),
                }}
              />
            </PolicyField>
          )}
        </form.AppField>
        <form.AppField name="files.exclusions">
          {() => (
            <PolicyField>
              <ExclusionsEditor
                form={form}
                label={t("exclusions.label")}
                description={t("exclusions.description")}
              />
            </PolicyField>
          )}
        </form.AppField>
        {showAdvanced ? (
          <form.AppField name="files.exclusionRuleFiles">
            {() => (
              <PolicyField>
                <ExclusionRuleFilesEditor
                  form={form}
                  label={t("exclusionRuleFiles.label")}
                  description={t("exclusionRuleFiles.description")}
                />
              </PolicyField>
            )}
          </form.AppField>
        ) : null}
        {showAdvanced ? (
          <form.AppField name="files.maxFileSize">
            {(field) => (
              <PolicyField>
                <field.Filesize
                  label={{
                    title: t("maxFileSize.label"),
                    description: t("maxFileSize.description"),
                  }}
                />
              </PolicyField>
            )}
          </form.AppField>
        ) : null}
      </div>
    </SettingsCategory>
  );
}

type ExclusionsEditorProps = {
  form: PolicyForm;
  label: string;
  description: string;
};

function ExclusionsEditor({ label, description, form }: ExclusionsEditorProps) {
  const { t } = useAppTranslation("policy.files");
  const { openEditExclusionDialog } = useEditExclusionDialog();

  const field = useFieldContext<
    | {
        rule: string;
      }[]
    | undefined
  >();

  const disabledContext = use(FormDisabledContext);
  const value = useStore(field.store, (state) => state.value);

  return (
    <DynamicField title={label} description={description}>
      {value && value.length > 0 ? (
        <div className="mb-2 mt-1 flex flex-col gap-3">
          {value.map((exclusion, index) => (
            <form.Field
              key={exclusion.rule}
              name={`files.exclusions[${index}].rule`}
            >
              {(subField) => (
                <div className="flex items-center justify-between gap-2">
                  <ExclusionPreview rule={subField.state.value as string} />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      type="button"
                      size="icon-sm"
                      className="shrink-0"
                      disabled={disabledContext}
                      onClick={() => {
                        openEditExclusionDialog({
                          initialValue: subField.state.value as string,
                          onSave: (rule) => {
                            subField.handleChange(rule);
                          },
                        });
                      }}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      size="icon-sm"
                      className="shrink-0"
                      disabled={disabledContext}
                      onClick={() => {
                        field.removeValue(index);
                      }}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              )}
            </form.Field>
          ))}
        </div>
      ) : null}
      <Button
        variant="secondary"
        type="button"
        disabled={disabledContext}
        onClick={() => {
          openEditExclusionDialog({
            initialValue: "",
            onSave: (rule) => {
              field.pushValue({
                rule,
              });
            },
          });
        }}
      >
        <PlusIcon />
        {t("exclusions.add")}
      </Button>
    </DynamicField>
  );
}

type ExclusionPreviewProps = {
  rule: string;
};

function ExclusionPreview({ rule }: ExclusionPreviewProps) {
  const { t } = useAppTranslation("policy.files.exclusions.preview");
  const parsed = parseExclusionRule(rule);

  return (
    <div className="flex flex-col">
      {parsed.type === "EXTENSION" ? (
        <>
          <p className="text-muted-foreground m-0! text-xs">{t("extension")}</p>
          <p className="font-medium">{parsed.extension}</p>
        </>
      ) : (
        <>
          <p className="text-muted-foreground m-0! text-xs">
            {parsed.foldersOnly ? t("name.foldersOnly") : t("name.both")}{" "}
            {t(`matchType.${parsed.matchType}`)}
          </p>
          <p className="font-medium">{parsed.pattern}</p>
        </>
      )}
    </div>
  );
}

type ExclusionRuleFilesEditorProps = {
  form: PolicyForm;
  label: string;
  description: string;
};

function ExclusionRuleFilesEditor({
  label,
  description,
  form,
}: ExclusionRuleFilesEditorProps) {
  const { t } = useAppTranslation("policy.files");

  const field = useFieldContext<
    | {
        filename: string;
      }[]
    | undefined
  >();

  const value = useStore(field.store, (state) => state.value);
  const disabledContext = use(FormDisabledContext);

  return (
    <DynamicField
      title={label}
      description={
        <>
          {description}
          <a
            className="text-primary ml-1 hover:opacity-90"
            href="https://kopia.io/docs/advanced/kopiaignore/"
            target="_blank"
            rel="noreferrer"
          >
            {t("exclusionRuleFiles.docs")}
          </a>
        </>
      }
    >
      {value && value.length > 0 ? (
        <div className="mb-2 mt-1 flex flex-col gap-3">
          {value.map((filename, index) => (
            <form.Field
              key={filename.filename}
              name={`files.exclusionRuleFiles[${index}].filename`}
            >
              {(subField) => (
                <div className="flex w-full items-start justify-between gap-2">
                  <Input
                    value={subField.state.value as string}
                    onChange={(e) => subField.handleChange(e.target.value)}
                    disabled={disabledContext}
                  />
                  <Button
                    variant="secondary"
                    type="button"
                    size="icon"
                    className="shrink-0"
                    disabled={disabledContext}
                    onClick={() => {
                      field.removeValue(index);
                    }}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              )}
            </form.Field>
          ))}
        </div>
      ) : null}
      <Button
        variant="secondary"
        type="button"
        disabled={disabledContext}
        onClick={() => {
          field.pushValue({
            filename: t("exclusionRuleFiles.example"),
          });
        }}
      >
        <PlusIcon />
        {t("exclusionRuleFiles.add")}
      </Button>
    </DynamicField>
  );
}
