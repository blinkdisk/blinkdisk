import { SettingsCategory } from "@desktop/components/policy/category";
import { usePolicyGeneralForm } from "@desktop/hooks/forms/use-policy-general-form";
import { FormDisabledContext, useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { EmojiCard } from "@ui/emoji-card";
import { EmojiPicker } from "@ui/emoji-picker";
import { SettingsIcon } from "lucide-react";
import { useContext } from "react";

export function FolderGeneralSettings() {
  const { t } = useAppTranslation("settings.folder.general");
  const { language } = useAppTranslation();

  const form = usePolicyGeneralForm();
  const isDirty = useStore(form.store, (state) => state.isDirty);
  const values = useStore(form.store, (state) => state.values);
  const disabledContext = useContext(FormDisabledContext);

  return (
    <SettingsCategory
      id="general"
      title={t("title")}
      description={t("description")}
      icon={<SettingsIcon />}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-row items-center justify-center gap-3">
          <EmojiPicker
            locale={language}
            onEmojiSelect={(emoji) => form.setFieldValue("emoji", emoji)}
          >
            <button disabled={disabledContext}>
              <EmojiCard emoji={values.emoji} size="lg" />
            </button>
          </EmojiPicker>
          <EmojiPicker
            locale={language}
            onEmojiSelect={(emoji) => form.setFieldValue("emoji", emoji)}
          >
            <Button disabled={disabledContext} variant="outline">
              {t("emoji.button")}
            </Button>
          </EmojiPicker>
        </div>
        <form.AppField name="name">
          {(field) => (
            <field.Text
              label={{ title: t("name.label"), required: true }}
              placeholder={t("name.placeholder")}
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.Submit disabled={!isDirty}>{t("save")}</form.Submit>
        </form.AppForm>
      </form>
    </SettingsCategory>
  );
}
