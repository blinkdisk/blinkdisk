import { useCreateFolderForm } from "@desktop/hooks/forms/use-create-folder-form";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { EmojiCard } from "@ui/emoji-card";
import { EmojiPicker } from "@ui/emoji-picker";

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
      <form.AppForm>
        <form.Submit>{t("continue")}</form.Submit>
      </form.AppForm>
    </form>
  );
}
