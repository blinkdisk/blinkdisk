import { RemoteTooltip } from "@desktop/components/vaults/remote-tooltip";
import { useProfile } from "@desktop/hooks/use-profile";
import { DropdownMenuItem, DropdownMenuItemProps } from "@ui/dropdown-menu";

export function LocalDropdownMenuItem(props: DropdownMenuItemProps) {
  const { remote } = useProfile();

  if (remote)
    return (
      <RemoteTooltip>
        <DropdownMenuItem {...props} disabled />
      </RemoteTooltip>
    );
  return <DropdownMenuItem {...props} />;
}
