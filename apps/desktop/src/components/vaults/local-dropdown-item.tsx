import {
  DropdownMenuItem,
  DropdownMenuItemProps,
} from "@blinkdisk/ui/dropdown-menu";
import { RemoteTooltip } from "@desktop/components/vaults/remote-tooltip";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";

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
