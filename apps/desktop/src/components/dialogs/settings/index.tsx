import { AccountSettingsDialog } from "#components/dialogs/settings/account";
import { PreferencesSettingsDialog } from "#components/dialogs/settings/preferences";

export function SettingsDialogs() {
  return (
    <>
      <AccountSettingsDialog />
      <PreferencesSettingsDialog />
    </>
  );
}
