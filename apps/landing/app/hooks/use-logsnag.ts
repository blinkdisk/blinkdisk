import { useCallback } from "react";

type LogsnagOptions = {
  channel: string;
  title: string;
  description: string;
  icon: string;
};

export function useLogsnag() {
  const logsnag = useCallback(async (options: LogsnagOptions) => {
    if (process.env.NODE_ENV === "development") {
      console.info(`[LogSnag] ${options.icon} ${options.title}`);
      console.info(`[LogSnag] ${options.description}`);
      return;
    }

    try {
      await fetch("https://api.logsnag.com/v1/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LOGSNAG_PUBLIC_KEY}`,
        },
        body: JSON.stringify({
          project: "blinkdisk",
          channel: options.channel,
          event: options.title,
          description: options.description,
          icon: options.icon,
          notify: true,
        }),
      });
    } catch (e) {
      console.warn("Failed to notify logsnag", e);
    }
  }, []);

  return { logsnag };
}
