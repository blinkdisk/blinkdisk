import { usePlatform } from "@marketing/hooks/use-platform";
import type { Platform } from "@marketing/utils/platform";
import { Button } from "@ui/button";
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
    <Button variant={isCurrentPlatform ? "default" : "outline"}>
      Download
    </Button>
  );
}
