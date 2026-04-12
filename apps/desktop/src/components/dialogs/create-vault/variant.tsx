import { FREE_SPACE_AVAILABLE } from "@blinkdisk/constants/space";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@blinkdisk/ui/card";
import { CloudBlinkIcon } from "@desktop/components/icons/cloudblink";
import { useAccountList } from "@desktop/hooks/queries/use-account-list";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { useSelectAccountDialog } from "@desktop/hooks/state/use-select-account-dialog";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useAuth } from "@desktop/hooks/use-auth";
import { formatSize } from "@desktop/lib/number";
import { CheckIcon, ExternalLinkIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

export type CreateVaultVariantProps = {
  selectCloud: () => void;
  selectCustom: () => void;
};

export function CreateVaultVariant({
  selectCloud,
  selectCustom,
}: CreateVaultVariantProps) {
  const { t } = useAppTranslation("vault.createDialog.variant");
  const { isOnlineAccount } = useAccountId();
  const { openAuthDialog } = useAuthDialog();
  const { openSelectAccountDialog } = useSelectAccountDialog();
  const { selectAccount } = useAuth();
  const { accounts } = useAccountList();
  const waitingForAuth = useRef(false);

  const handleSelectAccount = useCallback(() => {
    openSelectAccountDialog({
      onSelect: async (accountId) => {
        await selectAccount(accountId);
        selectCloud();
      },
    });
  }, [openSelectAccountDialog, selectAccount, selectCloud]);

  useEffect(() => {
    if (waitingForAuth.current && isOnlineAccount) {
      waitingForAuth.current = false;
      selectCloud();
    }
  }, [isOnlineAccount, selectCloud]);

  return (
    <div className="mt-8 flex flex-col gap-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CloudBlinkIcon className="h-4 w-auto" />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground px-3"
            onClick={() =>
              window.open(`${process.env.MARKETING_URL}/cloudblink?ref=desktop`)
            }
          >
            <ExternalLinkIcon />
            {t("cloudblink.readMore")}
          </Button>
        </CardHeader>
        <CardContent className="pb-6">
          <p className="text-muted-foreground text-sm">
            <CheckIcon className="mr-2 inline-block size-4" />
            {t("cloudblink.features.freeStorage", {
              freeSpace: formatSize(FREE_SPACE_AVAILABLE),
            })}
          </p>
          <p className="text-muted-foreground text-sm">
            <CheckIcon className="mr-2 inline-block size-4" />
            {t("cloudblink.features.noSetup")}
          </p>
          <p className="text-muted-foreground text-sm">
            <CheckIcon className="mr-2 inline-block size-4" />
            {t("cloudblink.features.cheaper")}
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              if (isOnlineAccount) {
                selectCloud();
              } else if (accounts.length > 0) {
                handleSelectAccount();
              } else {
                waitingForAuth.current = true;
                openAuthDialog();
              }
            }}
          >
            {isOnlineAccount
              ? t("cloudblink.continue")
              : accounts.length > 0
                ? t("cloudblink.selectAccount")
                : t("cloudblink.signIn")}
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("custom.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            <XIcon className="mr-2 inline-block size-4" />
            {t("custom.features.noFreeStorage")}
          </p>
          <p className="text-muted-foreground text-sm">
            <XIcon className="mr-2 inline-block size-4" />
            {t("custom.features.manualSetup")}
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" className="w-full" onClick={selectCustom}>
            {t("custom.button")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
