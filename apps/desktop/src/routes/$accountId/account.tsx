import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { useAccountList } from "@desktop/hooks/queries/use-account-list";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { AccountSettingsSection } from "@desktop/routes/$accountId/account/account-settings-section";
import { LocalAccountSection } from "@desktop/routes/$accountId/account/local-account-section";
import { PreferencesSettingsSection } from "@desktop/routes/$accountId/account/preferences-settings-section";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$accountId/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("settings.account");
  const { isOnlineAccount } = useAccountId();
  const { accounts } = useAccountList();
  const hasAccounts = accounts.length > 0;

  return (
    <div className="flex min-h-full flex-col overflow-y-auto px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">
            {t("title")}
          </h1>
        </div>

        {isOnlineAccount ? <AccountSettingsSection /> : null}
        {!isOnlineAccount && !hasAccounts ? <LocalAccountSection /> : null}
        <PreferencesSettingsSection />
      </div>
    </div>
  );
}
