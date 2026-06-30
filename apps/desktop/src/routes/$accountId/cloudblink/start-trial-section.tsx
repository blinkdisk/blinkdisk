import { TRIAL_DAYS, TRIAL_STORAGE } from "@blinkdisk/constants/space";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { SettingsPanel, SettingsRow } from "@desktop/components/settings";
import { useCreateVaultDialog } from "@desktop/hooks/state/use-create-vault-dialog";
import { formatSize } from "@desktop/lib/number";
import { PlusIcon } from "lucide-react";

export function StartTrialSection() {
  const { t } = useAppTranslation("cloudblink.page.empty");
  const { openCreateVault } = useCreateVaultDialog();

  return (
    <SettingsPanel>
      <SettingsRow
        title={t("title")}
        titleClassName="text-lg font-semibold"
        description={t("description", {
          storage: formatSize(TRIAL_STORAGE),
          days: TRIAL_DAYS,
        })}
      >
        <Button
          onClick={() =>
            openCreateVault({
              step: "DETAILS",
              provider: "CLOUDBLINK",
              autoSelectedProvider: true,
            })
          }
          className="w-fit"
        >
          <PlusIcon />
          {t("button")}
        </Button>
      </SettingsRow>
    </SettingsPanel>
  );
}
