import axios from "axios";

type LogsnagOptions = {
  channel: string;
  title: string;
  description: string;
  icon: string;
};

export async function logsnag(options: LogsnagOptions) {
  if (
    ("env" in import.meta &&
      (import.meta as unknown as { env: { DEV: boolean } }).env.DEV) ||
    (process && "env" in process && process.env.NODE_ENV === "development")
  ) {
    console.info(`[LogSnag] ${options.icon} ${options.title}`);
    console.info(`[LogSnag] ${options.description}`);
    return;
  }

  try {
    if (!process.env.LOGSNAG_PRIVATE_KEY) throw new Error("No key provided");

    return await axios.post(
      "https://api.logsnag.com/v1/log",
      {
        project: "blinkdisk",
        channel: options.channel,
        event: options.title,
        description: options.description,
        icon: options.icon,
        notify: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LOGSNAG_PRIVATE_KEY}`,
        },
      },
    );
  } catch (e) {
    console.warn("Failed to notify logsnag", e);
  }
}
