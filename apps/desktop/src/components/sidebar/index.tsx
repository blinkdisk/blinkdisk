import { AccountMenuDropdown } from "#components/accounts/menu-dropdown";
import { AccountPreview } from "#components/accounts/preview";
import { AccountSelectDropdown } from "#components/accounts/select-dropdown";
import { Logo } from "#components/logo";
import { SidebarAddFolder } from "#components/sidebar/add-folder";
import { SidebarSelects } from "#components/sidebar/dropdowns";
import { SidebarFolderList } from "#components/sidebar/folder-list";
import { SidebarSkeletonTheme } from "#components/sidebar/skeleton-theme";
import { SidebarStorageAlert } from "#components/sidebar/storage-alert";
import { useFolderList } from "#hooks/queries/core/use-folder-list";
import { useAccount } from "#hooks/queries/use-account";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Link, useLocation, useParams } from "@tanstack/react-router";
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@ui/sidebar";
import { EllipsisVerticalIcon, HomeIcon, SettingsIcon } from "lucide-react";
import { ComponentProps } from "react";

export function Sidebar({ ...props }: ComponentProps<typeof SidebarContainer>) {
  const { data: session } = useAccount();
  const { data: folders } = useFolderList();

  const { vaultId, hostName, userName } = useParams({ strict: false });

  const { t } = useAppTranslation("sidebar.links");

  const pathname = useLocation({
    select: ({ pathname }) => pathname,
  });

  return (
    <SidebarSkeletonTheme>
      <SidebarContainer variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="pl-2 pt-1">
              <Link to="/app" tabIndex={-1}>
                <Logo />
              </Link>
            </SidebarMenuItem>
            <SidebarSelects />
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="mt-4 flex flex-col gap-0 p-2">
          {vaultId ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="px-3"
                  isActive={
                    pathname === `/app/${vaultId}/${hostName}/${userName}`
                  }
                  render={
                    <Link to="/app/{-$vaultId}/{-$hostName}/{-$userName}">
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
                    `/app/${vaultId}/${hostName}/${userName}/settings`
                  }
                  render={
                    <Link to="/app/{-$vaultId}/{-$hostName}/{-$userName}/settings">
                      <SettingsIcon />
                      {t("settings")}
                    </Link>
                  }
                />
              </SidebarMenuItem>
            </>
          ) : null}
          <SidebarFolderList folders={folders} />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu className="gap-4">
            <SidebarStorageAlert />
            <SidebarAddFolder />
            <SidebarMenuItem className="flex items-center">
              <AccountSelectDropdown>
                <SidebarMenuButton size="lg">
                  <AccountPreview account={session} />
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
