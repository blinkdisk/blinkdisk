import { Button } from "@blinkdisk/ui/button";
import { usePlatform } from "@marketing/hooks/use-platform";
import type { Platform } from "@marketing/utils/platform";

type Props = {
  os: Platform;
  className?: string;
};

export function DownloadButton({ os, className }: Props) {
  const { platform } = usePlatform();

  const isCurrentPlatform = platform === os;

  return (
    <Button
      variant={isCurrentPlatform ? "default" : "outline"}
      render={
        <a href="/download" aria-label={`Download BlinkDisk for ${os}`} />
      }
      className={className}
      nativeButton={false}
    >
      Download
    </Button>
  );
}
