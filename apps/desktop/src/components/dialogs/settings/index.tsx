import { AccountSettingsDialog } from "@desktop/components/dialogs/settings/account";
import { PreferencesSettingsDialog } from "@desktop/components/dialogs/settings/preferences";

export function SettingsDialogs() {
  return (
    <>
      <AccountSettingsDialog />
      <PreferencesSettingsDialog />
    </>
  );
}
