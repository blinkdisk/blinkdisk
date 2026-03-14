import { CreateVaultDialog } from "#components/dialogs/create-vault/index";
import { SettingsDialogs } from "#components/dialogs/settings/index";
import { Sidebar } from "#components/sidebar/index";
import { SidebarInset } from "@blinkdisk/ui/sidebar";
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
