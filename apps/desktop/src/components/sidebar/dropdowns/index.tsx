import { cn } from "@blinkdisk/utils/class";
import { SidebarHostNameSelect } from "@desktop/components/sidebar/dropdowns/hostName";
import { SidebarUserNameSelect } from "@desktop/components/sidebar/dropdowns/userName";
import { useVaultProfiles } from "@desktop/hooks/queries/core/use-vault-profiles";
import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

export function SidebarSelects() {
  const { data: profiles } = useVaultProfiles();

  const { hostName } = useParams({ strict: false });

  const userNames = useMemo(
    () => profiles?.find((profile) => profile.hostName === hostName)?.userNames,
    [profiles, hostName],
  );

  const sections = useMemo(() => {
    return [
      ...((profiles?.length || 0) > 1 ? ["HOSTNAME"] : []),
      ...((userNames?.length || 0) > 1 ? ["USERNAME"] : []),
    ];
  }, [profiles, userNames]);

  if (!sections.length) return null;
  return (
    <div className="mt-4 flex w-full flex-col">
      {sections.map((section, index) => {
        const className = cn(
          index > 0 && "rounded-t-none",
          index < sections.length - 1 && "rounded-b-none border-b-0",
        );

        return section === "HOSTNAME" ? (
          <SidebarHostNameSelect key="HOSTNAME" className={className} />
        ) : section === "USERNAME" ? (
          <SidebarUserNameSelect key="USERNAME" className={className} />
        ) : null;
      })}
    </div>
  );
}
