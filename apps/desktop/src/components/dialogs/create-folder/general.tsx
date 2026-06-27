import { FolderCard } from "@blinkdisk/components/folder-card";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZCreateFolderFormType } from "@blinkdisk/schemas/folder";
import { Button } from "@blinkdisk/ui/button";
import { EmojiPicker } from "@blinkdisk/ui/emoji-picker";
import type { useCreateFolderForm } from "@desktop/hooks/forms/use-create-folder-form";
import { PlusIcon, SlidersHorizontalIcon } from "lucide-react";

type CreateFolderGeneralProps = {
  form: ReturnType<typeof useCreateFolderForm>;
  values: ZCreateFolderFormType;
  isCreatingFolder: boolean;
  isCreatingDraft: boolean;
  onAction: (action: "CREATE" | "POLICY") => void;
};

export function CreateFolderGeneral({
  form,
  values,
  isCreatingFolder,
  isCreatingDraft,
  onAction,
}: CreateFolderGeneralProps) {
  const { language, t } = useAppTranslation("folder.createDialog");

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
            <FolderCard emoji={values.emoji} size={3.5} />
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
      <form.AppField
        name="path"
        listeners={{
          onChange: async ({ value, fieldApi }) => {
            if (!value || fieldApi.form.getFieldMeta("name")?.isDirty) return;

            fieldApi.form.setFieldValue(
              "name",
              await window.electron.path.basename(value),
              {
                dontUpdateMeta: true,
              },
            );
          },
        }}
      >
        {(field) => (
          <field.Path
            label={{ title: t("path.label"), required: true }}
            placeholder={t("path.placeholder")}
            title={t("path.title")}
            type="directory"
            className="ph-no-capture"
          />
        )}
      </form.AppField>
      <form.AppField name="name">
        {(field) => (
          <field.Text
            label={{ title: t("name.label"), required: true }}
            placeholder={t("name.placeholder")}
          />
        )}
      </form.AppField>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          type="submit"
          variant="secondary"
          loading={isCreatingDraft}
          disabled={isCreatingFolder || isCreatingDraft}
          onClick={() => onAction("POLICY")}
        >
          <SlidersHorizontalIcon />
          {t("changePolicy")}
        </Button>
        <Button
          type="submit"
          loading={isCreatingFolder}
          disabled={isCreatingDraft || isCreatingFolder}
          onClick={() => onAction("CREATE")}
        >
          <PlusIcon />
          {t("submit")}
        </Button>
      </div>
    </form>
  );
}
