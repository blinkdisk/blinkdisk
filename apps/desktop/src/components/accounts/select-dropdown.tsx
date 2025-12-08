import { AccountPreview } from "@desktop/components/accounts/preview";
import { useAccountList } from "@desktop/hooks/queries/use-account-list";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useAuth } from "@desktop/hooks/use-auth";
import { useAppTranslation } from "@hooks/use-app-translation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { UserPlusIcon } from "lucide-react";
import { ReactNode } from "react";

export type AccountSelectDropdownProps = {
  children: ReactNode;
};

export function AccountSelectDropdown({
  children,
}: AccountSelectDropdownProps) {
  const { t } = useAppTranslation("sidebar");

  const { accountId } = useAccountId();
  const { addAccount, selectAccount } = useAuth();
  const { data: accounts, isPending } = useAccountList();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="top"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          {(!isPending ? accounts : new Array(2).fill(undefined))?.map(
            (account, index) => (
              <DropdownMenuItem
                key={account ? account.user.id : index}
                onClick={() =>
                  account &&
                  account.user.id !== accountId &&
                  selectAccount(account.session.token)
                }
              >
                <AccountPreview account={account} />
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={addAccount}>
          <UserPlusIcon />
          {t("accountListMenu.addAccount")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
