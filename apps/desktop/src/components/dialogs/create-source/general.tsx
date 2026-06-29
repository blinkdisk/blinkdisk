import { SourceCard } from "@blinkdisk/components/source-card";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import {
  isFileLikeSource,
  type SourceType,
  type ZCreateSourceFormType,
} from "@blinkdisk/schemas/source";
import { Button } from "@blinkdisk/ui/button";
import { EmojiPicker } from "@blinkdisk/ui/emoji-picker";
import { Tabs, TabsList, TabsTrigger } from "@blinkdisk/ui/tabs";
import type { useCreateSourceForm } from "@desktop/hooks/forms/use-create-source-form";
import {
  FileIcon,
  FolderIcon,
  PlusIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

type CreateSourceGeneralProps = {
  form: ReturnType<typeof useCreateSourceForm>;
  values: ZCreateSourceFormType;
  isCreatingSource: boolean;
  isCreatingDraft: boolean;
  onAction: (action: "CREATE" | "POLICY") => void;
};

export function CreateSourceGeneral({
  form,
  values,
  isCreatingSource,
  isCreatingDraft,
  onAction,
}: CreateSourceGeneralProps) {
  const { language, t } = useAppTranslation("folder.createDialog");
  const pathType = isFileLikeSource(values.type) ? "file" : "directory";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
      className="mt-8 flex flex-col gap-6"
    >
      <div className="flex flex-row items-center justify-center gap-3">
        <EmojiPicker
          locale={language}
          clearLabel={t("emoji.clear")}
          onEmojiClear={
            values.emoji
              ? () => form.setFieldValue("emoji", undefined)
              : undefined
          }
          onEmojiSelect={(emoji) => form.setFieldValue("emoji", emoji)}
        >
          <button type="button">
            <SourceCard emoji={values.emoji} type={values.type} size={3.5} />
          </button>
        </EmojiPicker>
        <EmojiPicker
          locale={language}
          clearLabel={t("emoji.clear")}
          onEmojiClear={
            values.emoji
              ? () => form.setFieldValue("emoji", undefined)
              : undefined
          }
          onEmojiSelect={(emoji) => form.setFieldValue("emoji", emoji)}
        >
          <Button variant="secondary">{t("emoji.change")}</Button>
        </EmojiPicker>
      </div>
      <Tabs
        value={pathType}
        onValueChange={(value) => {
          form.setFieldValue("type", value as SourceType);
          form.setFieldValue("path", "");
          form.setFieldValue("name", "", { dontUpdateMeta: true });
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="directory">
            <FolderIcon />
            {t("type.folder")}
          </TabsTrigger>
          <TabsTrigger value="file">
            <FileIcon />
            {t("type.file")}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <form.AppField
        name="path"
        listeners={{
          onChange: async ({ value, fieldApi }) => {
            if (!value) return;

            const [detectedType, name] = await Promise.all([
              window.electron.fs.sourceType(value),
              window.electron.path.basename(value),
            ]);

            fieldApi.form.setFieldValue("type", detectedType, {
              dontUpdateMeta: true,
            });

            if (fieldApi.form.getFieldMeta("name")?.isDirty) return;

            fieldApi.form.setFieldValue("name", name, {
              dontUpdateMeta: true,
            });
          },
        }}
      >
        {(field) => (
          <field.Path
            label={{ title: t(`path.${pathType}.label`), required: true }}
            placeholder={t(`path.${pathType}.placeholder`)}
            title={t(`path.${pathType}.title`)}
            type={pathType}
            className="ph-no-capture"
          />
        )}
      </form.AppField>
      <form.AppField name="name">
        {(field) => (
          <field.Text
            label={{ title: t(`name.${pathType}.label`), required: true }}
            placeholder={t(`name.${pathType}.placeholder`)}
          />
        )}
      </form.AppField>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          type="submit"
          variant="secondary"
          loading={isCreatingDraft}
          disabled={isCreatingSource || isCreatingDraft}
          onClick={() => onAction("POLICY")}
        >
          <SlidersHorizontalIcon />
          {t("changePolicy")}
        </Button>
        <Button
          type="submit"
          loading={isCreatingSource}
          disabled={isCreatingDraft || isCreatingSource}
          onClick={() => onAction("CREATE")}
        >
          <PlusIcon />
          {t("submit")}
        </Button>
      </div>
    </form>
  );
}
