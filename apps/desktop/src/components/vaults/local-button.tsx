import { Button, ButtonProps } from "@blinkdisk/ui/button";
import { RemoteTooltip } from "@desktop/components/vaults/remote-tooltip";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";

export function LocalButton(props: ButtonProps) {
  const { remote } = useLocalProfile();

  if (remote)
    return (
      <RemoteTooltip>
        <Button {...props} disabled />
      </RemoteTooltip>
    );
  return <Button {...props} />;
}
