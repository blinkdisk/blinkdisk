import { ReadOnlyTooltip } from "@desktop/components/vaults/readonly-tooltip";
import { useProfile } from "@desktop/hooks/use-profile";
import { DropdownMenuItem, DropdownMenuItemProps } from "@ui/dropdown-menu";

export function MutatingDropdownMenuItem(props: DropdownMenuItemProps) {
  const { readOnly } = useProfile();

  if (readOnly)
    return (
      <ReadOnlyTooltip>
        <DropdownMenuItem {...props} disabled />
      </ReadOnlyTooltip>
    );
  return <DropdownMenuItem {...props} />;
}
