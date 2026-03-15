import { PostHog } from "posthog-node";

export function getPostHog() {
  return new PostHog(process.env.POSTHOG_KEY, {
    host: "https://eu.i.posthog.com",
  });
}

export async function posthog(...args: Parameters<PostHog["capture"]>) {
  try {
    if (!process.env.POSTHOG_KEY) return null;

    const posthog = getPostHog();
    posthog.capture(...args);
    await posthog.shutdown();
  } catch (e) {
    console.warn("Failed to notify posthog", e);
  }
}
