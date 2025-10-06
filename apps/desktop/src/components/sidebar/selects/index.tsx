import { SidebarDeviceSelect } from "@desktop/components/sidebar/selects/device";
import { SidebarProfileSelect } from "@desktop/components/sidebar/selects/profile";
import { SidebarVaultSelect } from "@desktop/components/sidebar/selects/vault";
import { useDeviceList } from "@desktop/hooks/queries/use-device-list";
import { useDeviceProfileList } from "@desktop/hooks/queries/use-device-profile-list";
import { useProfileVaultList } from "@desktop/hooks/queries/use-profile-vault-list";
import { SidebarMenuItem } from "@ui/sidebar";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@utils/class";
import { useMemo } from "react";

export function SidebarSelects() {
  const { data: devices, isPending: isDevicesPending } = useDeviceList();
  const { data: profiles, isPending: isProfilesPending } =
    useDeviceProfileList();
  const { data: vaults, isPending: isVaultsPending } = useProfileVaultList();

  const sections = useMemo(() => {
    return [
      ...((devices?.length || 0) > 1 ? ["DEVICES"] : []),
      ...((profiles?.length || 0) > 1 ? ["PROFILES"] : []),
      // Only one vault is required to show the dropdown,
      // to be able to add a new vault from there.
      ...((vaults?.length || 0) > 0 ? ["VAULTS"] : []),
    ];
  }, [devices, profiles, vaults]);

  const isPending = useMemo(() => {
    return isDevicesPending || isProfilesPending || isVaultsPending;
  }, [isDevicesPending, isProfilesPending, isVaultsPending]);

  if (isPending) return <Skeleton className="mt-8 h-11 w-full !rounded-lg" />;
  if (!sections.length) return null;
  return (
    <SidebarMenuItem className="mt-8 flex w-full flex-col">
      {sections.map((section, index) => {
        const className = cn(
          index > 0 && "rounded-t-none",
          index < sections.length - 1 && "rounded-b-none border-b-0",
        );

        return section === "DEVICES" ? (
          <SidebarDeviceSelect key="DEVICES" className={className} />
        ) : section === "PROFILES" ? (
          <SidebarProfileSelect key="PROFILES" className={className} />
        ) : section === "VAULTS" ? (
          <SidebarVaultSelect key="VAULTS" className={className} />
        ) : null;
      })}
    </SidebarMenuItem>
  );
}
