import { AccountMenuDropdown } from "@desktop/components/accounts/menu-dropdown";
import { AccountPreview } from "@desktop/components/accounts/preview";
import { AccountSelectDropdown } from "@desktop/components/accounts/select-dropdown";
import { Logo } from "@desktop/components/logo";
import { SidebarAddFolder } from "@desktop/components/sidebar/add-folder";
import { SidebarFolderList } from "@desktop/components/sidebar/folder-list";
import { SidebarSelects } from "@desktop/components/sidebar/selects";
import { SidebarSkeletonTheme } from "@desktop/components/sidebar/skeleton-theme";
import { SidebarStorageAlert } from "@desktop/components/sidebar/storage-alert";
import { useFolderList } from "@desktop/hooks/queries/core/use-folder-list";
import { useAccount } from "@desktop/hooks/queries/use-account";
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
import { EllipsisVertical, HomeIcon, SettingsIcon } from "lucide-react";
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
                  asChild
                >
                  <Link to="/app/{-$vaultId}/{-$hostName}/{-$userName}">
                    <HomeIcon />
                    {t("home")}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="px-3"
                  isActive={
                    pathname ===
                    `/app/${vaultId}/${hostName}/${userName}/settings`
                  }
                  asChild
                >
                  <Link to="/app/{-$vaultId}/{-$hostName}/{-$userName}/settings">
                    <SettingsIcon />
                    {t("settings")}
                  </Link>
                </SidebarMenuButton>
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
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <AccountPreview account={session} />
                </SidebarMenuButton>
              </AccountSelectDropdown>
              <AccountMenuDropdown>
                <SidebarMenuButton
                  size="icon"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <EllipsisVertical className="size-4" />
                </SidebarMenuButton>
              </AccountMenuDropdown>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContainer>
    </SidebarSkeletonTheme>
  );
}
