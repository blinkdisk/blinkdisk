import type { WorkflowStep } from "cloudflare:workers";

export function waitUntil(
  env: Pick<CloudflareBindings, "NODE_ENV">,
  step: WorkflowStep,
  description: string,
  date: Date | number,
) {
  if (env.NODE_ENV === "development")
    return step.waitForEvent(description, { type: "next" });

  return step.sleepUntil(description, date);
}
