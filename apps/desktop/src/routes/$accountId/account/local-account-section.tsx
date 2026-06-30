import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { SettingsPanel, SettingsRow } from "@desktop/components/settings";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { SignInPoint } from "@desktop/routes/$accountId/account/sign-in-point";
import { BellIcon, CloudIcon, KeyRoundIcon, LogInIcon } from "lucide-react";

export function LocalAccountSection() {
  const { t } = useAppTranslation("settings.account.local");
  const { openAuthDialog } = useAuthDialog();

  return (
    <SettingsPanel>
      <SettingsRow title={t("title")} titleClassName="text-lg font-semibold">
        <Button
          onClick={() => openAuthDialog()}
          size="lg"
          className="w-fit px-6"
        >
          <LogInIcon />
          {t("button")}
        </Button>
      </SettingsRow>
      <SettingsRow fullWidth>
        <div className="grid gap-4">
          <SignInPoint
            icon={<CloudIcon />}
            title={t("features.cloudblink.title")}
            description={t("features.cloudblink.description")}
          />
          <SignInPoint
            icon={<KeyRoundIcon />}
            title={t("features.sync.title")}
            description={t("features.sync.description")}
          />
          <SignInPoint
            icon={<BellIcon />}
            title={t("features.notifications.title")}
            description={t("features.notifications.description")}
          />
        </div>
      </SettingsRow>
    </SettingsPanel>
  );
}
