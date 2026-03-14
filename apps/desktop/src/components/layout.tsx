import { CreateVaultDialog } from "#components/dialogs/create-vault";
import { SettingsDialogs } from "#components/dialogs/settings";
import { Sidebar } from "#components/sidebar";
import { SidebarInset } from "@ui/sidebar";
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
