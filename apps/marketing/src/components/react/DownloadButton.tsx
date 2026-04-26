import { Button } from "@blinkdisk/ui/button";
import { usePlatform } from "@marketing/hooks/use-platform";
import type { Platform } from "@marketing/utils/platform";
import { useEffect, useState } from "react";

type Props = {
  os: Platform;
  className?: string;
};

export function DownloadButton({ os, className }: Props) {
  const { platform } = usePlatform();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCurrentPlatform = mounted && platform === os;

  return (
    <Button
      variant={isCurrentPlatform ? "default" : "outline"}
      render={<a href="/download" />}
      className={className}
    >
      Download
    </Button>
  );
}
