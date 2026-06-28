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
import { SidebarSelects } from "@desktop/components/sidebar/dropdowns";
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

  const { accountId, vaultId, hostName, userName } = useParams({
    strict: false,
  });

  const { t } = useAppTranslation("sidebar.links");

  const pathname = useLocation({
    select: ({ pathname }) => pathname,
  });

  if (!accountId) return null;

  const accountParams = { accountId };
  const vaultPath =
    accountId && vaultId && hostName && userName
      ? `/${accountId}/${vaultId}/${hostName}/${userName}`
      : undefined;
  const settingsPath = vaultPath ? `${vaultPath}/settings` : undefined;
  const policiesPath = vaultPath ? `${vaultPath}/policies` : undefined;
  const vaultParams = vaultId ? { ...accountParams, vaultId } : null;
  const profileParams =
    vaultParams && hostName && userName
      ? { ...vaultParams, hostName, userName }
      : null;

  return (
    <SidebarSkeletonTheme>
      <SidebarContainer variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="pl-3 py-2">
              <Link to="/$accountId" params={accountParams} tabIndex={-1}>
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
                    <Link to="/$accountId" params={accountParams}>
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
                      <Link to="/$accountId/cloudblink" params={accountParams}>
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
                    <Link to="/$accountId/account" params={accountParams}>
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
                    <Link to="/$accountId" params={accountParams}>
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
              <SidebarSelects />
              <SidebarMenuItem className="mt-4">
                <SidebarMenuButton
                  className="px-3"
                  isActive={
                    pathname ===
                    `/${accountId}/${vaultId}/${hostName}/${userName}`
                  }
                  render={
                    profileParams ? (
                      <Link
                        to="/$accountId/$vaultId/$hostName/$userName"
                        params={profileParams}
                      >
                        <LayoutDashboardIcon />
                        {t("overview")}
                      </Link>
                    ) : vaultParams ? (
                      <Link to="/$accountId/$vaultId" params={vaultParams}>
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
                    profileParams ? (
                      <Link
                        to="/$accountId/$vaultId/$hostName/$userName/policies"
                        params={profileParams}
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
                    profileParams ? (
                      <Link
                        to="/$accountId/$vaultId/$hostName/$userName/settings"
                        params={profileParams}
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
