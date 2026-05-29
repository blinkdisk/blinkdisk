import { Logo } from "@blinkdisk/components/logo";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@blinkdisk/ui/sidebar";
import { AccountMenuDropdown } from "@desktop/components/accounts/menu-dropdown";
import { AccountPreview } from "@desktop/components/accounts/preview";
import { AccountSelectDropdown } from "@desktop/components/accounts/select-dropdown";
import { SidebarAlerts } from "@desktop/components/sidebar/alerts";
import { SidebarSelects } from "@desktop/components/sidebar/dropdowns";
import { SidebarFolderList } from "@desktop/components/sidebar/folder-list";
import { SidebarSkeletonTheme } from "@desktop/components/sidebar/skeleton-theme";
import { VaultMenuDropdown } from "@desktop/components/vaults/menu-dropdown";
import { VaultPreview } from "@desktop/components/vaults/preview";
import { useFolderList } from "@desktop/hooks/queries/core/use-folder-list";
import { useAccount } from "@desktop/hooks/queries/use-account";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { Link, useLocation, useParams } from "@tanstack/react-router";
import {
  EllipsisVerticalIcon,
  HomeIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  VaultIcon,
} from "lucide-react";
import type { ComponentProps } from "react";

export function Sidebar({ ...props }: ComponentProps<typeof SidebarContainer>) {
  const { isLocalAccount } = useAccountId();
  const { data: account } = useAccount();
  const { data: vault } = useVault();
  const { data: folders } = useFolderList();

  const { accountId, vaultId, hostName, userName } = useParams({
    strict: false,
  });

  const { t } = useAppTranslation("sidebar.links");

  const pathname = useLocation({
    select: ({ pathname }) => pathname,
  });

  return (
    <SidebarSkeletonTheme>
      <SidebarContainer variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="pl-3 py-2">
              <Link to="/{-$accountId}" tabIndex={-1}>
                <Logo />
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="flex flex-col gap-6 p-2">
          {vaultId && vault ? (
            <VaultMenuDropdown>
              <SidebarMenuButton className="shrink-0" size="lg">
                <VaultPreview vault={vault} />
              </SidebarMenuButton>
            </VaultMenuDropdown>
          ) : null}
          <SidebarSelects />
          {!vaultId ? (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="px-3"
                isActive={pathname === `/${accountId}`}
                render={
                  <Link to="/{-$accountId}">
                    <LayoutDashboardIcon />
                    {t("dashboard")}
                  </Link>
                }
              />
            </SidebarMenuItem>
          ) : (
            <>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="px-3"
                    isActive={
                      pathname ===
                      `/${accountId}/${vaultId}/${hostName}/${userName}`
                    }
                    render={
                      <Link to="/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}">
                        <HomeIcon />
                        {t("home")}
                      </Link>
                    }
                  />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="px-3"
                    isActive={
                      pathname ===
                      `/${accountId}/${vaultId}/${hostName}/${userName}/settings`
                    }
                    render={
                      <Link to="/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/settings">
                        <SettingsIcon />
                        {t("settings")}
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              </SidebarMenu>
              <SidebarFolderList folders={folders} />
            </>
          )}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu className="gap-4">
            <SidebarAlerts />
            <SidebarMenuItem className="flex items-center">
              <AccountSelectDropdown>
                <SidebarMenuButton size="lg">
                  <AccountPreview
                    account={account}
                    local={isLocalAccount || false}
                  />
                </SidebarMenuButton>
              </AccountSelectDropdown>
              <AccountMenuDropdown>
                <SidebarMenuButton size="icon">
                  <EllipsisVerticalIcon className="size-4" />
                </SidebarMenuButton>
              </AccountMenuDropdown>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContainer>
    </SidebarSkeletonTheme>
  );
}
