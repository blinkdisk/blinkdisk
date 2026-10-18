import { DynamicField } from "@blinkdisk/components/dynamic-field";
import {
  FormDisabledContext,
  useFieldContext,
  useStore,
} from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Button } from "@blinkdisk/ui/button";
import { Input } from "@blinkdisk/ui/input";
import { SettingsCategory } from "@desktop/components/policy/category";
import { PolicyContext } from "@desktop/components/policy/context";
import { PolicyField } from "@desktop/components/policy/field";
import type { PolicyForm } from "@desktop/hooks/forms/use-policy-form";
import { useEditExclusionDialog } from "@desktop/hooks/state/use-edit-exclusion-dialog";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import {
  formatRelativeExclusionPath,
  getBrokenExclusionRule,
  parseExclusionRule,
} from "@desktop/lib/exclusion";
import {
  EditIcon,
  PlusIcon,
  TrashIcon,
  TriangleAlertIcon,
  WandSparklesIcon,
} from "lucide-react";
import { useContext, useMemo } from "react";

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
  const { root, canBrowse } = useExclusionRoot();

  const field = useFieldContext<
    | {
        rule: string;
      }[]
    | undefined
  >();

  const disabledContext = useContext(FormDisabledContext);
  const value = useStore(field.store, (state) => state.value);

  const brokenRules = useMemo(
    () => (value || []).map(({ rule }) => getBrokenExclusionRule(rule, root)),
    [value, root],
  );
  const brokenCount = brokenRules.filter(Boolean).length;
  const fixableCount = brokenRules.filter((broken) => broken?.fixed).length;
  const allOutsideRoot = brokenRules.every(
    (broken) => !broken || broken.error === "OUTSIDE_ROOT",
  );

  return (
    <DynamicField
      title={label}
      description={root ? t("exclusions.descriptionWithRoot") : description}
    >
      {brokenCount > 0 ? (
        <Alert variant="warn" className="mb-2 mt-1">
          <TriangleAlertIcon />
          <AlertTitle className="line-clamp-none">
            {t("exclusions.broken.title", { count: brokenCount })}
          </AlertTitle>
          <AlertDescription>
            <p>
              {!root
                ? t("exclusions.broken.descriptionWithoutRoot")
                : allOutsideRoot
                  ? t("exclusions.broken.descriptionOutside", { root })
                  : t("exclusions.broken.description")}
            </p>
            {fixableCount > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-1"
                disabled={disabledContext}
                onClick={() => {
                  field.handleChange(
                    (value || []).map((item, index) => ({
                      ...item,
                      rule: brokenRules[index]?.fixed ?? item.rule,
                    })),
                  );
                }}
              >
                <WandSparklesIcon />
                {t("exclusions.broken.fix", { count: fixableCount })}
              </Button>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}
      {value && value.length > 0 ? (
        <div className="mb-2 mt-1 flex flex-col gap-3">
          {value.map((_, index) => (
            <form.Field key={index} name={`files.exclusions[${index}].rule`}>
              {(subField) => (
                <div className="flex items-center justify-between gap-2">
                  <ExclusionPreview
                    rule={subField.state.value as string}
                    root={root}
                  />
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
                          root,
                          canBrowse,
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
            root,
            canBrowse,
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

function useExclusionRoot() {
  const { target } = useContext(PolicyContext);
  const { localHostName, localUserName } = useLocalProfile();

  if (target?.kind !== "SOURCE" && target?.kind !== "DRAFT_SOURCE") {
    return { root: undefined, canBrowse: false };
  }

  return {
    root: target.path,
    canBrowse:
      target.hostName === localHostName && target.userName === localUserName,
  };
}

type ExclusionPreviewProps = {
  rule: string;
  root?: string;
};

function ExclusionPreview({ rule, root }: ExclusionPreviewProps) {
  const { t } = useAppTranslation("policy.files.exclusions.preview");
  const parsed = useMemo(() => parseExclusionRule(rule), [rule]);
  const broken = useMemo(
    () => getBrokenExclusionRule(rule, root),
    [rule, root],
  );

  return (
    <div className="flex min-w-0 flex-col">
      {broken ? (
        <>
          <p className="m-0! flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
            <TriangleAlertIcon className="size-3" />
            {broken.fixed || !root
              ? t("broken.fullPath")
              : broken.error === "OUTSIDE_ROOT"
                ? t("broken.outside")
                : broken.error === "IS_ROOT"
                  ? t("broken.isRoot")
                  : t("broken.invalid")}
          </p>
          <p className="truncate font-medium">{rule}</p>
        </>
      ) : parsed.type === "PATH" && parsed.path ? (
        <>
          <p className="text-muted-foreground m-0! text-xs">{t("path")}</p>
          <p className="truncate font-medium">
            {formatRelativeExclusionPath(parsed.path, root)}
          </p>
        </>
      ) : parsed.type === "EXTENSION" ? (
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
  const disabledContext = useContext(FormDisabledContext);

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
          {value.map((_, index) => (
            <form.Field
              key={index}
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
