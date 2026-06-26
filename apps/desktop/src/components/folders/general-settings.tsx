import { DynamicField } from "@blinkdisk/components/dynamic-field";
import { FolderCard } from "@blinkdisk/components/folder-card";
import { FormDisabledContext, useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { EmojiPicker } from "@blinkdisk/ui/emoji-picker";
import { Input } from "@blinkdisk/ui/input";
import { SettingsCategory } from "@desktop/components/policy/category";
import { PolicyContext } from "@desktop/components/policy/context";
import type { PolicyForm } from "@desktop/hooks/forms/use-policy-form";
import { useFolder } from "@desktop/hooks/use-folder";
import { useContext } from "react";

export function FolderGeneralSettings({ form }: { form: PolicyForm }) {
  const { t } = useAppTranslation("settings.folder.general");
  const { language } = useAppTranslation();
  const { folderId, profile, target } = useContext(PolicyContext);
  const { data: folder } = useFolder(folderId, { profile });

  const values = useStore(form.store, (state) => state.values);
  const disabledContext = useContext(FormDisabledContext);
  const path =
    target && "path" in target ? target.path : folder?.source?.path || "";

  return (
    <SettingsCategory
      id="general"
      title={t("title")}
      description={t("description")}
    >
      <div>
        <div className="flex flex-col gap-4">
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
              <button disabled={disabledContext} type="button">
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
              <Button
                disabled={disabledContext}
                variant="secondary"
                type="button"
              >
                {t("emoji.change")}
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
            <Input value={path} disabled />
          </DynamicField>
        </div>
      </div>
    </SettingsCategory>
  );
}
