import { SidebarInset } from "@blinkdisk/ui/sidebar";
import { CreateVaultDialog } from "@desktop/components/dialogs/create-vault/index";
import { SettingsDialogs } from "@desktop/components/dialogs/settings/index";
import { Sidebar } from "@desktop/components/sidebar/index";
import { ReactNode } from "react";

export type LayoutProps = {
  children?: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Sidebar />
      <SettingsDialogs />
      <CreateVaultDialog />
      <SidebarInset className="!overflow-hidden">{children}</SidebarInset>
    </>
  );
}
