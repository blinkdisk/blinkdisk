type LogsnagOptions = {
  channel: string;
  title: string;
  description: string;
  icon: string;
};

async function postLogsnag(options: LogsnagOptions) {
  const response = await fetch("https://api.logsnag.com/v1/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LOGSNAG_PRIVATE_KEY}`,
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

  if (!response.ok) {
    throw new Error(`LogSnag request failed: ${response.status}`);
  }

  return response;
}

export async function logsnag(options: LogsnagOptions) {
  if (
    ("env" in import.meta &&
      (import.meta as unknown as { env: { DEV: boolean } }).env.DEV) ||
    (typeof process !== "undefined" &&
      "env" in process &&
      process.env.NODE_ENV === "development")
  ) {
    console.info(`[LogSnag] ${options.icon} ${options.title}`);
    console.info(`[LogSnag] ${options.description}`);
    return;
  }

  try {
    if (!process.env.LOGSNAG_PRIVATE_KEY) throw new Error("No key provided");

    return await postLogsnag(options);
  } catch (e) {
    console.warn("Failed to notify logsnag", e);
  }
}
