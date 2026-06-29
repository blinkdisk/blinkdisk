import { DynamicField } from "@blinkdisk/components/dynamic-field";
import { SourceCard } from "@blinkdisk/components/source-card";
import { FormDisabledContext, useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import {
  isFileLikeSource,
  sourceTypeWithFallback,
} from "@blinkdisk/schemas/source";
import { Button } from "@blinkdisk/ui/button";
import { EmojiPicker } from "@blinkdisk/ui/emoji-picker";
import { Input } from "@blinkdisk/ui/input";
import { SettingsCategory } from "@desktop/components/policy/category";
import { PolicyContext } from "@desktop/components/policy/context";
import type { PolicyForm } from "@desktop/hooks/forms/use-policy-form";
import { useSource } from "@desktop/hooks/use-source";
import { useContext } from "react";

export function SourceGeneralSettings({ form }: { form: PolicyForm }) {
  const { t } = useAppTranslation("settings.folder.general");
  const { language } = useAppTranslation();
  const { sourceId, profile, target } = useContext(PolicyContext);
  const { data: source } = useSource(sourceId, { profile });

  const values = useStore(form.store, (state) => state.values);
  const disabledContext = useContext(FormDisabledContext);
  const path =
    target && "path" in target ? target.path : source?.source?.path || "";
  const sourceType = sourceTypeWithFallback(
    source?.type || values.initialSourceType,
  );
  const fileLike = isFileLikeSource(sourceType);

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
                <SourceCard emoji={values.emoji} type={sourceType} size={3.5} />
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
          <DynamicField title={t(fileLike ? "path.fileLabel" : "path.label")}>
            <Input value={path} disabled />
          </DynamicField>
        </div>
      </div>
    </SettingsCategory>
  );
}
