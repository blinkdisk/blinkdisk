import { SettingsCategory } from "@desktop/components/policy/category";
import { PolicyField } from "@desktop/components/policy/field";
import { usePolicyFilesForm } from "@desktop/hooks/forms/use-policy-files-form";
import { useEditExclusionDialog } from "@desktop/hooks/state/use-edit-exclusion-dialog";
import { parseExclusionRule } from "@desktop/lib/exclusion";
import {
  FormDisabledContext,
  useFieldContext,
  useStore,
} from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { LabelContainer } from "@ui/label";
import { EditIcon, FileXIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useContext, useMemo } from "react";

export function FilesSettings() {
  const { t } = useAppTranslation("policy.files");

  const form = usePolicyFilesForm();
  const isDirty = useStore(form.store, (state) => state.isDirty);

  return (
    <SettingsCategory
      id="files"
      title={t("title")}
      description={t("description")}
      icon={<FileXIcon />}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
        className="flex flex-col gap-4"
      >
        <form.AppField name="denylist">
          {() => (
            <PolicyField>
              <DenylistEditor
                form={form}
                label={t("denylist.label")}
                description={t("denylist.description")}
              />
            </PolicyField>
          )}
        </form.AppField>
        <form.AppField name="denyfiles">
          {() => (
            <PolicyField>
              <DenyfilesEditor
                form={form}
                label={t("denyfiles.label")}
                description={t("denyfiles.description")}
              />
            </PolicyField>
          )}
        </form.AppField>
        <form.AppField name="maxFileSize">
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
        <form.AppField name="excludeCacheDirs">
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
        <form.AppForm>
          <form.Submit className="mt-2" disabled={!isDirty}>
            {t("save")}
          </form.Submit>
        </form.AppForm>
      </form>
    </SettingsCategory>
  );
}

type DenylistEditorProps = {
  form: ReturnType<typeof usePolicyFilesForm>;
  label: string;
  description: string;
};

function DenylistEditor({ label, description, form }: DenylistEditorProps) {
  const { t } = useAppTranslation("policy.files");
  const { openEditExclusionDialog } = useEditExclusionDialog();

  const field = useFieldContext<
    | {
        expression: string;
      }[]
    | undefined
  >();

  const disabledContext = useContext(FormDisabledContext);
  const value = useStore(field.store, (state) => state.value);

  return (
    <LabelContainer title={label} description={description}>
      {value && value.length > 0 ? (
        <div className="mb-2 mt-1 flex flex-col gap-3">
          {value.map((_, index) => (
            <form.Field key={index} name={`denylist[${index}].expression`}>
              {(subField) => (
                <div className="flex items-center justify-between gap-2">
                  <ExclusionPreview rule={subField.state.value as string} />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
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
                      variant="outline"
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
        variant="outline"
        type="button"
        disabled={disabledContext}
        onClick={() => {
          openEditExclusionDialog({
            initialValue: "",
            onSave: (rule) => {
              field.pushValue({
                expression: rule,
              });
            },
          });
        }}
      >
        <PlusIcon />
        {t("denylist.add")}
      </Button>
    </LabelContainer>
  );
}

type ExclusionPreviewProps = {
  rule: string;
};

function ExclusionPreview({ rule }: ExclusionPreviewProps) {
  const { t } = useAppTranslation("policy.files.denylist.preview");
  const parsed = useMemo(() => parseExclusionRule(rule), [rule]);

  return (
    <div className="flex flex-col">
      {parsed.type === "EXTENSION" ? (
        <>
          <p className="text-muted-foreground text-xs">{t("extension")}</p>
          <p className="font-medium">{parsed.extension}</p>
        </>
      ) : (
        <>
          <p className="text-muted-foreground text-xs">
            {parsed.foldersOnly ? t("name.foldersOnly") : t("name.both")}{" "}
            {t("matchType." + parsed.matchType)}
          </p>
          <p className="font-medium">{parsed.pattern}</p>
        </>
      )}
    </div>
  );
}

type DenyfilesEditorProps = {
  form: ReturnType<typeof usePolicyFilesForm>;
  label: string;
  description: string;
};

function DenyfilesEditor({ label, description, form }: DenyfilesEditorProps) {
  const { t } = useAppTranslation("policy.files");

  const field = useFieldContext<
    | {
        filename: string;
      }[]
    | undefined
  >();

  const value = useStore(field.store, (state) => state.value);
  const disabledContext = useContext(FormDisabledContext);

  return (
    <LabelContainer
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
            {t("denyfiles.docs")}
          </a>
        </>
      }
    >
      {value && value.length > 0 ? (
        <div className="mb-2 mt-1 flex flex-col gap-3">
          {value.map((_, index) => (
            <form.Field key={index} name={`denyfiles[${index}].filename`}>
              {(subField) => (
                <div className="flex w-full items-start justify-between gap-2">
                  <Input
                    value={subField.state.value as string}
                    onChange={(e) => subField.handleChange(e.target.value)}
                    disabled={disabledContext}
                  />
                  <Button
                    variant="outline"
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
        variant="outline"
        type="button"
        disabled={disabledContext}
        onClick={() => {
          field.pushValue({
            filename: t("denyfiles.example"),
          });
        }}
      >
        <PlusIcon />
        {t("denyfiles.add")}
      </Button>
    </LabelContainer>
  );
}
