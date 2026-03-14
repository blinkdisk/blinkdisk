import { RemoteTooltip } from "#components/vaults/remote-tooltip";
import { useLocalProfile } from "#hooks/use-local-profile";
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
