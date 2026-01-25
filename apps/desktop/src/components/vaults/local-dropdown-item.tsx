import { RemoteTooltip } from "@desktop/components/vaults/remote-tooltip";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { DropdownMenuItem, DropdownMenuItemProps } from "@ui/dropdown-menu";

export function LocalDropdownMenuItem(props: DropdownMenuItemProps) {
  const { remote } = useLocalProfile();

  if (remote)
    return (
      <RemoteTooltip>
        <DropdownMenuItem {...props} disabled />
      </RemoteTooltip>
    );
  return <DropdownMenuItem {...props} />;
}
