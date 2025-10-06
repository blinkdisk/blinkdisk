import { EmojiCard } from "@desktop/components/folders/emoji-card";
import { useCreateFolderForm } from "@desktop/hooks/forms/use-create-folder-form";
import { useCreateFolder } from "@desktop/hooks/mutations/use-create-folder";
import { useCreateFolderDialog } from "@desktop/hooks/state/use-create-folder-dialog";
import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { EmojiPicker } from "@ui/emoji-picker";
import { CircleFadingArrowUpIcon, PlusIcon } from "lucide-react";
import { useCallback, useState } from "react";

export function CreateFolderDialog() {
  const { t } = useAppTranslation("folder.createDialog");
  const { isOpen, setIsOpen } = useCreateFolderDialog();
  const { openUpgradeDialog } = useUpgradeDialog();
  const { language } = useAppTranslation();

  const [alertShown, setAlertShown] = useState(false);

  const { mutateAsync, isPending } = useCreateFolder({
    onError: (error) => {
      if (error.message === "FOLDER_TOO_LARGE") {
        setIsOpen(false);
        setAlertShown(true);
      }
    },
    onSuccess: () => {
      form.reset();
      setIsOpen(false);
      setAlertShown(false);
    },
  });

  const form = useCreateFolderForm({
    onSubmit: async ({ value }) => {
      await mutateAsync(value);
    },
  });

  const values = useStore(form.store, (state) => state.values);

  const reset = useCallback(() => {
    form.reset();
  }, [form]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen} onClosed={reset}>
        <DialogContent className="w-120 block max-h-[80vh] overflow-y-auto">
          <div className="flex items-center gap-3">
            <DialogTitle>{t("title")}</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            {t("description")}
          </DialogDescription>
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
                  if (!value || fieldApi.form.getFieldMeta("name")?.isDirty)
                    return;

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
              <form.Submit>{t("submit")}</form.Submit>
            </form.AppForm>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={alertShown} onOpenChange={() => setAlertShown(false)}>
        <DialogContent className="w-110">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {t("exceedingAlert.title")}
            </DialogTitle>
            <DialogDescription>
              {t("exceedingAlert.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              onClick={async () => {
                await mutateAsync({
                  ...values,
                  force: true,
                });
              }}
              variant="outline"
              className="w-1/2"
              loading={isPending}
            >
              <PlusIcon className="mr-2" />
              {t("exceedingAlert.continue")}
            </Button>
            <Button
              onClick={() => {
                setAlertShown(false);
                openUpgradeDialog();
              }}
              className="w-1/2"
            >
              <CircleFadingArrowUpIcon className="mr-2" />
              {t("exceedingAlert.upgrade")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
