import { useOpenBillingPortal } from "#hooks/mutations/use-open-billing-portal";
import { useBilling } from "#hooks/queries/use-billing";
import { useAccountSettingsDialog } from "#hooks/state/use-account-settings-dialog";
import { usePreferencesSettingsDialog } from "#hooks/state/use-preferences-settings-dialog";
import { useAuth } from "#hooks/use-auth";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useIsMobile } from "@hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import {
  CogIcon,
  CreditCardIcon,
  LogOutIcon,
  UserIcon,
  UserPlusIcon,
} from "lucide-react";
import { ReactElement } from "react";

export type AccountMenuDropdownProps = {
  children: ReactElement;
};

export function AccountMenuDropdown({ children }: AccountMenuDropdownProps) {
  const { t } = useAppTranslation("sidebar");

  const isMobile = useIsMobile();

  const { addAccount, logout } = useAuth();

  const { data: billing } = useBilling();
  const { mutate: openBillingPortal } = useOpenBillingPortal();

  const { openAccountSettings } = useAccountSettingsDialog();
  const { openPreferencesSettings } = usePreferencesSettingsDialog();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={children} />
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={openAccountSettings}>
            <UserIcon />
            {t("accountMenu.account")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openPreferencesSettings}>
            <CogIcon />
            {t("accountMenu.preferences")}
          </DropdownMenuItem>
          {billing?.portalEnabled ? (
            <DropdownMenuItem onClick={() => openBillingPortal()}>
              <CreditCardIcon />
              {t("accountMenu.billing")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOutIcon />
          {t("accountMenu.logout")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={addAccount}>
          <UserPlusIcon />
          {t("accountMenu.addAccount")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
