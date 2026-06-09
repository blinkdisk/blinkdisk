import { SidebarInset } from "@blinkdisk/ui/sidebar";
import { CreateVaultDialog } from "@desktop/components/dialogs/create-vault/index";
import { UpgradeDialog } from "@desktop/components/dialogs/upgrade";
import { Sidebar } from "@desktop/components/sidebar/index";
import type { ReactNode } from "react";

export type LayoutProps = {
  children?: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Sidebar />
      <CreateVaultDialog />
      <UpgradeDialog />
      <SidebarInset className="!overflow-hidden">{children}</SidebarInset>
    </>
  );
}
