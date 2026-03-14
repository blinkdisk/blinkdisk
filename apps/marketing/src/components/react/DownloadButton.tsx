import { usePlatform } from "#hooks/use-platform";
import type { Platform } from "#utils/platform";
import { Button } from "@blinkdisk/ui/button";
import { useEffect, useState } from "react";

type Props = {
  os: Platform;
};

export function DownloadButton({ os }: Props) {
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
    >
      Download
    </Button>
  );
}
