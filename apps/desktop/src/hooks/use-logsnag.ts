import { useAccount } from "@desktop/hooks/queries/use-account";

type LogsnagOptions = {
  channel: string;
  title: string;
  description: string;
  icon: string;
};

export function useLogsnag() {
  const { data: account } = useAccount();

  const logsnag = async (options: LogsnagOptions) => {
    const email = `[${account?.email || "local"}]`;

    if (import.meta.env.DEV) {
      console.info(`[LogSnag] ${options.icon} ${options.title}`);
      console.info(`[LogSnag] ${email} ${options.description}`);
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
          description: `${email} ${options.description}`,
          icon: options.icon,
          notify: true,
        }),
      });
    } catch (e) {
      console.warn("Failed to notify logsnag", e);
    }
  };

  return { logsnag };
}
