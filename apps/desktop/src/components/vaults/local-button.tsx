import { RemoteTooltip } from "@desktop/components/vaults/remote-tooltip";
import { useProfile } from "@desktop/hooks/use-profile";
import { Button, ButtonProps } from "@ui/button";

export function LocalButton(props: ButtonProps) {
  const { remote } = useProfile();

  if (remote)
    return (
      <RemoteTooltip>
        <Button {...props} disabled />
      </RemoteTooltip>
    );
  return <Button {...props} />;
}
