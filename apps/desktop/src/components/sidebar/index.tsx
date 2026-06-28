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
import { AccountPreview } from "@desktop/components/accounts/preview";
import { AccountSelectDropdown } from "@desktop/components/accounts/select-dropdown";
import { SidebarAlerts } from "@desktop/components/sidebar/alerts";
import { SidebarSkeletonTheme } from "@desktop/components/sidebar/skeleton-theme";
import { VaultMenuDropdown } from "@desktop/components/vaults/menu-dropdown";
import { VaultPreview } from "@desktop/components/vaults/preview";
import { useAccount } from "@desktop/hooks/queries/use-account";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { Link, useLocation, useParams } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  CloudIcon,
  FileCogIcon,
  HomeIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import type { ComponentProps } from "react";

export function Sidebar({ ...props }: ComponentProps<typeof SidebarContainer>) {
  const { isLocalAccount, isOnlineAccount } = useAccountId();
  const { data: account } = useAccount();
  const { data: vault } = useVault();

  const { accountId, vaultId } = useParams({
    strict: false,
  });

  const { t } = useAppTranslation("sidebar.links");

  const pathname = useLocation({
    select: ({ pathname }) => pathname,
  });

  if (!accountId) return null;

  const vaultPath =
    accountId && vaultId ? `/${accountId}/${vaultId}` : undefined;
  const settingsPath = vaultPath ? `${vaultPath}/settings` : undefined;
  const policiesPath = vaultPath ? `${vaultPath}/policies` : undefined;

  return (
    <SidebarSkeletonTheme>
      <SidebarContainer variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="pl-3 py-2">
              <Link to="/$accountId" from="/$accountId" tabIndex={-1}>
                <Logo />
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="flex flex-col gap-6 p-2">
          {!vaultId ? (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="px-3"
                  isActive={pathname === `/${accountId}`}
                  render={
                    <Link to="/$accountId" from="/$accountId">
                      <HomeIcon />
                      {t("home")}
                    </Link>
                  }
                />
              </SidebarMenuItem>
              {isOnlineAccount ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="px-3"
                    isActive={pathname === `/${accountId}/cloudblink`}
                    render={
                      <Link to="/$accountId/cloudblink" from="/$accountId">
                        <CloudIcon />
                        {t("cloudblink")}
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ) : null}
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="px-3"
                  isActive={pathname === `/${accountId}/account`}
                  render={
                    <Link to="/$accountId/account" from="/$accountId">
                      <UserIcon />
                      {t("account")}
                    </Link>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          ) : (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="px-3 text-muted-foreground hover:text-foreground"
                  render={
                    <Link to="/$accountId" from="/$accountId">
                      <ArrowLeftIcon />
                      {t("backToAccount")}
                    </Link>
                  }
                />
              </SidebarMenuItem>
              <SidebarMenuItem className="mt-4">
                <VaultMenuDropdown>
                  <SidebarMenuButton className="shrink-0" size="lg">
                    {vault ? <VaultPreview vault={vault} /> : null}
                  </SidebarMenuButton>
                </VaultMenuDropdown>
              </SidebarMenuItem>
              <SidebarMenuItem className="mt-4">
                <SidebarMenuButton
                  className="px-3"
                  isActive={pathname === vaultPath}
                  render={
                    vaultId ? (
                      <Link
                        to="/$accountId/$vaultId"
                        from="/$accountId/$vaultId"
                      >
                        <LayoutDashboardIcon />
                        {t("overview")}
                      </Link>
                    ) : (
                      <span>
                        <LayoutDashboardIcon />
                        {t("overview")}
                      </span>
                    )
                  }
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="px-3"
                  isActive={pathname === policiesPath}
                  render={
                    vaultId ? (
                      <Link
                        to="/$accountId/$vaultId/policies"
                        from="/$accountId/$vaultId"
                      >
                        <FileCogIcon />
                        {t("policies")}
                      </Link>
                    ) : (
                      <span>
                        <FileCogIcon />
                        {t("policies")}
                      </span>
                    )
                  }
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="px-3"
                  isActive={pathname === settingsPath}
                  render={
                    vaultId ? (
                      <Link
                        to="/$accountId/$vaultId/settings"
                        from="/$accountId/$vaultId"
                      >
                        <SettingsIcon />
                        {t("settings")}
                      </Link>
                    ) : (
                      <span>
                        <SettingsIcon />
                        {t("settings")}
                      </span>
                    )
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
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
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContainer>
    </SidebarSkeletonTheme>
  );
}
