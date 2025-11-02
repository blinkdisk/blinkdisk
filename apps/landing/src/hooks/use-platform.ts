import { getPlatformFromOS } from "@landing/utils/platform";
import { useMemo } from "react";
import { UAParser } from "ua-parser-js";

export function usePlatform() {
  const { cpu, os } = useMemo(() => {
    if (typeof window === "undefined") return { cpu: null, os: null };

    const userAgent = window.navigator.userAgent;
    const { cpu, os } = UAParser(userAgent);

    return { cpu, os };
  }, []);

  const isMobile = useMemo(() => {
    if (os === null) return false;
    return os.name === "iOS" || os.name === "Android";
  }, [os]);

  const platform = useMemo(() => {
    if (os === null) return null;
    return getPlatformFromOS(os.name);
  }, [os]);

  return { platform, isMobile, cpu, os };
}
