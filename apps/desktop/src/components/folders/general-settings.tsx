import { FormDisabledContext, useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { DynamicField } from "@blinkdisk/ui/dynamic-field";
import { EmojiCard } from "@blinkdisk/ui/emoji-card";
import { EmojiPicker } from "@blinkdisk/ui/emoji-picker";
import { Input } from "@blinkdisk/ui/input";
import { SettingsCategory } from "@desktop/components/policy/category";
import { PolicyContext } from "@desktop/components/policy/context";
import { usePolicyGeneralForm } from "@desktop/hooks/forms/use-policy-general-form";
import { useFolder } from "@desktop/hooks/use-folder";
import { SettingsIcon } from "lucide-react";
import { useContext } from "react";

export function FolderGeneralSettings() {
  const { t } = useAppTranslation("settings.folder.general");
  const { language } = useAppTranslation();
  const { folderId } = useContext(PolicyContext);
  const { data: folder } = useFolder(folderId);

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
      <div>
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
              <Button disabled={disabledContext} variant="secondary">
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
          <DynamicField title={t("path.label")}>
            <Input value={folder?.source?.path} disabled />
          </DynamicField>
          <form.AppForm>
            <form.Submit disabled={!isDirty}>{t("save")}</form.Submit>
          </form.AppForm>
        </form>
      </div>
    </SettingsCategory>
  );
}
