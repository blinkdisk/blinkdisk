import { SettingsCategory } from "@desktop/components/policy/category";
import { usePolicyFilesForm } from "@desktop/hooks/forms/use-policy-files-form";
import {
  FormDisabledContext,
  useFieldContext,
  useStore,
} from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZPolicyLevelType } from "@schemas/policy";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { LabelContainer } from "@ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { FileXIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useContext } from "react";

type FilesSettingsProps = {
  level: ZPolicyLevelType;
};

export function FilesSettings({ level }: FilesSettingsProps) {
  const { t } = useAppTranslation("policy.files");

  const form = usePolicyFilesForm(level);
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
            <DenylistEditor
              form={form}
              label={t("denylist.label")}
              description={t("denylist.description")}
              level={level}
            />
          )}
        </form.AppField>
        <form.AppField name="denyfiles">
          {() => (
            <DenyfilesEditor
              form={form}
              label={t("denyfiles.label")}
              description={t("denyfiles.description")}
              level={level}
            />
          )}
        </form.AppField>
        <form.AppField name="maxFileSize">
          {(field) => (
            <field.Filesize
              label={{
                title: t("maxFileSize.label"),
                description: t("maxFileSize.description"),
              }}
            />
          )}
        </form.AppField>
        <form.AppField name="excludeCacheDirs">
          {(field) => (
            <field.Switch
              label={{
                title: t("excludeCacheDirs.label"),
                description: t("excludeCacheDirs.description"),
              }}
            />
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
  level: ZPolicyLevelType;
};

function DenylistEditor({
  label,
  description,
  form,
  level,
}: DenylistEditorProps) {
  const { t } = useAppTranslation("policy.files");

  const field = useFieldContext<
    | {
        expression: string;
        level: ZPolicyLevelType;
      }[]
    | undefined
  >();

  const disabledContext = useContext(FormDisabledContext);
  const value = useStore(field.store, (state) => state.value);

  return (
    <LabelContainer title={label} description={description}>
      {value && value.length > 0 ? (
        <div className="mb-2 mt-1 flex flex-col gap-3">
          {value.map((value, index) => (
            <form.Field key={index} name={`denylist[${index}].expression`}>
              {(subField) => (
                <div className="flex w-full items-start justify-between gap-2">
                  <Select
                    value={
                      (subField.state.value as string).startsWith("*.")
                        ? "EXTENSION"
                        : (subField.state.value as string).endsWith("/")
                          ? "DIRECTORY"
                          : "FILE"
                    }
                    onValueChange={(to) => {
                      subField.handleChange(
                        t(`denylist.type.${to.toLowerCase()}.example`),
                      );
                    }}
                    disabled={disabledContext || value.level !== level}
                  >
                    <SelectTrigger className="w-fit gap-1">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXTENSION">
                        {t("denylist.type.extension.label")}
                      </SelectItem>
                      <SelectItem value="DIRECTORY">
                        {t("denylist.type.directory.label")}
                      </SelectItem>
                      <SelectItem value="FILE">
                        {t("denylist.type.file.label")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={subField.state.value as string}
                    onChange={(e) => subField.handleChange(e.target.value)}
                    disabled={disabledContext || value.level !== level}
                  />
                  <Button
                    variant="outline"
                    type="button"
                    size="icon"
                    className="shrink-0"
                    disabled={disabledContext || value.level !== level}
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
            expression: t("denylist.type.file.example"),
            level,
          });
        }}
      >
        <PlusIcon />
        {t("denylist.add")}
      </Button>
    </LabelContainer>
  );
}

type DenyfilesEditorProps = {
  form: ReturnType<typeof usePolicyFilesForm>;
  label: string;
  description: string;
  level: ZPolicyLevelType;
};

function DenyfilesEditor({
  label,
  description,
  form,
  level,
}: DenyfilesEditorProps) {
  const { t } = useAppTranslation("policy.files");

  const field = useFieldContext<
    | {
        filename: string;
        level: ZPolicyLevelType;
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
          {value.map((value, index) => (
            <form.Field key={index} name={`denyfiles[${index}].filename`}>
              {(subField) => (
                <div className="flex w-full items-start justify-between gap-2">
                  <Input
                    value={subField.state.value as string}
                    onChange={(e) => subField.handleChange(e.target.value)}
                    disabled={disabledContext || value.level !== level}
                  />
                  <Button
                    variant="outline"
                    type="button"
                    size="icon"
                    className="shrink-0"
                    disabled={disabledContext || value.level !== level}
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
            level,
          });
        }}
      >
        <PlusIcon />
        {t("denyfiles.add")}
      </Button>
    </LabelContainer>
  );
}
