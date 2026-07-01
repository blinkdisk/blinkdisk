import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@blinkdisk/ui/tooltip";
import { Email } from "@desktop/components/accounts/email";
import { SignOutDialog } from "@desktop/components/dialogs/sign-out";
import { SettingsPanel, SettingsRow } from "@desktop/components/settings";
import { useUpdateAccountForm } from "@desktop/hooks/forms/use-update-account-form";
import { useSignOutDialog } from "@desktop/hooks/state/use-sign-out-dialog";
import { useEmailVisibility } from "@desktop/hooks/use-email-visibility";
import { useStore } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon, LogOutIcon } from "lucide-react";

export function AccountSettingsSection() {
  const { t } = useAppTranslation("settings.account");
  const { openSignOutDialog } = useSignOutDialog();
  const { isEmailVisible, toggleEmailVisibility } = useEmailVisibility();
  const form = useUpdateAccountForm();
  const [isDirty, isSubmitting, email] = useStore(form.store, (state) => [
    state.isDirty,
    state.isSubmitting,
    state.values.email,
  ]);

  const submitIfNeeded = () => {
    if (!isDirty || isSubmitting) return;

    form.handleSubmit();
  };

  return (
    <>
      <SettingsPanel>
        <form
          className="contents"
          onSubmit={(e) => {
            e.preventDefault();
            submitIfNeeded();
          }}
          onBlur={(e) => {
            if (!(e.target instanceof HTMLInputElement)) return;
            if (!["firstName", "lastName"].includes(e.target.name)) return;

            if (
              e.relatedTarget instanceof HTMLInputElement &&
              e.currentTarget.contains(e.relatedTarget) &&
              ["firstName", "lastName"].includes(e.relatedTarget.name)
            ) {
              return;
            }

            submitIfNeeded();
          }}
        >
          <SettingsRow title={t("profile.fullName")}>
            <div className="grid w-full gap-3 md:w-64 md:grid-cols-2">
              <form.AppField name="firstName">
                {(field) => (
                  <field.Text
                    label={{
                      title: t("profile.firstName.label"),
                      labelClassName: "sr-only",
                    }}
                    placeholder={t("profile.firstName.placeholder")}
                  />
                )}
              </form.AppField>
              <form.AppField name="lastName">
                {(field) => (
                  <field.Text
                    label={{
                      title: t("profile.lastName.label"),
                      labelClassName: "sr-only",
                    }}
                    placeholder={t("profile.lastName.placeholder")}
                  />
                )}
              </form.AppField>
            </div>
          </SettingsRow>
          <SettingsRow title={t("profile.email.label")}>
            <div className="flex min-w-0 items-center justify-end gap-2 md:w-64">
              <Email
                email={email}
                className="min-w-0 flex-1 text-sm md:text-right"
                hiddenVariant="blur"
              />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-label={t(
                        isEmailVisible
                          ? "emailVisibility.hide"
                          : "emailVisibility.show",
                      )}
                      aria-pressed={!isEmailVisible}
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={toggleEmailVisibility}
                    >
                      {isEmailVisible ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                  }
                />
                <TooltipContent>
                  {t(
                    isEmailVisible
                      ? "emailVisibility.hide"
                      : "emailVisibility.show",
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          </SettingsRow>
        </form>
        <SettingsRow title={t("signOut.title")} separated>
          <Button
            type="button"
            variant="destructive-secondary"
            onClick={openSignOutDialog}
            className="w-fit"
          >
            <LogOutIcon />
            {t("signOut.button")}
          </Button>
        </SettingsRow>
      </SettingsPanel>
      <SignOutDialog />
    </>
  );
}
