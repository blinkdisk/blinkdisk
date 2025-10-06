import { ReadOnlyTooltip } from "@desktop/components/vaults/readonly-tooltip";
import { useProfile } from "@desktop/hooks/use-profile";
import { Button, ButtonProps } from "@ui/button";

export function MutatingButton(props: ButtonProps) {
  const { readOnly } = useProfile();

  if (readOnly)
    return (
      <ReadOnlyTooltip>
        <Button {...props} disabled />
      </ReadOnlyTooltip>
    );
  return <Button {...props} />;
}
