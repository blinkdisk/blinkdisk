import { SidebarHostNameSelect } from "@desktop/components/sidebar/selects/hostName";
import { SidebarUserNameSelect } from "@desktop/components/sidebar/selects/userName";
import { SidebarVaultSelect } from "@desktop/components/sidebar/selects/vault";
import { useVaultProfiles } from "@desktop/hooks/queries/core/use-vault-profiles";
import { useVaultList } from "@desktop/hooks/queries/use-vault-list";
import { useParams } from "@tanstack/react-router";
import { SidebarMenuItem } from "@ui/sidebar";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@utils/class";
import { useMemo } from "react";

export function SidebarSelects() {
  const { data: vaults, isPending: isVaultsPending } = useVaultList();
  const { data: profiles } = useVaultProfiles();

  const { hostName } = useParams({ strict: false });

  const userNames = useMemo(
    () => profiles?.find((profile) => profile.hostName === hostName)?.userNames,
    [profiles, hostName],
  );

  const sections = useMemo(() => {
    return [
      // Only one vault is required to show the dropdown,
      // to be able to add a new vault from there.
      ...((vaults?.length || 0) > 0 ? ["VAULTS"] : []),
      ...((profiles?.length || 0) > 1 ? ["HOSTNAME"] : []),
      ...((userNames?.length || 0) > 1 ? ["USERNAME"] : []),
    ];
  }, [profiles, vaults, userNames]);

  if (isVaultsPending)
    return <Skeleton className="mt-8 h-11 w-full !rounded-lg" />;
  if (!sections.length) return null;
  return (
    <SidebarMenuItem className="mt-8 flex w-full flex-col">
      {sections.map((section, index) => {
        const className = cn(
          index > 0 && "rounded-t-none",
          index < sections.length - 1 && "rounded-b-none border-b-0",
        );

        return section === "HOSTNAME" ? (
          <SidebarHostNameSelect key="HOSTNAME" className={className} />
        ) : section === "USERNAME" ? (
          <SidebarUserNameSelect key="USERNAME" className={className} />
        ) : section === "VAULTS" ? (
          <SidebarVaultSelect key="VAULTS" className={className} />
        ) : null;
      })}
    </SidebarMenuItem>
  );
}
