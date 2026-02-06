import { useCreateFolderForm } from "@desktop/hooks/forms/use-create-folder-form";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { EmojiCard } from "@ui/emoji-card";
import { EmojiPicker } from "@ui/emoji-picker";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { FileIcon, FolderIcon } from "lucide-react";

type CreateFolderGeneralProps = {
  form: ReturnType<typeof useCreateFolderForm>;
};

export function CreateFolderGeneral({ form }: CreateFolderGeneralProps) {
  const { language, t } = useAppTranslation("folder.createDialog");

  const values = useStore(form.store, (store) => store.values);

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
          onEmojiSelect={(emoji) => form.setFieldValue("emoji", emoji)}
        >
          <button>
            <EmojiCard emoji={values.emoji} size="lg" />
          </button>
        </EmojiPicker>
        <EmojiPicker
          locale={language}
          onEmojiSelect={(emoji) => form.setFieldValue("emoji", emoji)}
        >
          <Button variant="outline">{t("emoji.button")}</Button>
        </EmojiPicker>
      </div>
      <div className="flex flex-col gap-2">
        <Tabs
          value={values.type}
          onValueChange={(value) => {
            const newType = value as "file" | "folder";
            form.setFieldValue("type", newType);

            const currentEmoji = form.getFieldValue("emoji");
            const isDefaultEmoji = currentEmoji === "📁" || currentEmoji === "📄";
            if (isDefaultEmoji) {
              form.setFieldValue("emoji", newType === "file" ? "📄" : "📁");
            }
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="folder" className="flex-1 gap-2">
              <FolderIcon className="size-4" />
              {t("type.folder")}
            </TabsTrigger>
            <TabsTrigger value="file" className="flex-1 gap-2">
              <FileIcon className="size-4" />
              {t("type.file")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <form.AppField
        name="path"
        listeners={{
          onChange: async ({ value, fieldApi }) => {
            if (!value) return;

            if (!fieldApi.form.getFieldMeta("name")?.isDirty) {
              fieldApi.form.setFieldValue(
                "name",
                await window.electron.path.basename(value),
                {
                  dontUpdateMeta: true,
                },
              );
            }
          },
        }}
      >
        {(field) => (
          <field.Path
            label={{ title: t("path.label"), required: true }}
            placeholder={t("path.placeholder")}
            title={t("path.title")}
            type={values.type === "file" ? "file" : "directory"}
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
      <form.AppForm>
        <form.Submit>{t("continue")}</form.Submit>
      </form.AppForm>
    </form>
  );
}
