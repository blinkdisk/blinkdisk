import { cleanup, sendCleanupEmails } from "#utils/cleanup";
import { database } from "@blinkdisk/db/index";
import { verifyServiceToken } from "@blinkdisk/utils/token";
import * as Sentry from "@sentry/cloudflare";

export default Sentry.withSentry(
  (env: CloudflareBindings) => ({
    dsn: env.SENTRY_CLOUD_DSN,
    sendDefaultPii: true,
    enabled: env.NODE_ENV !== "development",
  }),
  {
    async fetch(request: Request, env: CloudflareBindings): Promise<Response> {
      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/health") {
        return Response.json({ status: "ok" });
      }

      if (request.method === "GET" && url.pathname === "/") {
        const upgradeHeader = request.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader !== "websocket")
          return new Response("Worker expected Upgrade: websocket", {
            status: 426,
          });

        const header = request.headers.get("Authorization");
        if (!header)
          return new Response("Missing Authorization header", { status: 401 });

        const token = header.replace("Bearer ", "");
        const payload = await verifyServiceToken(
          token,
          // The dotenv parser sometimes leaves a trailing backslash
          env.CLOUD_JWT_PUBLIC_KEY.replace(/\\+$/gm, ""),
        );
        if (!payload) return new Response("Invalid token", { status: 401 });

        let vaultId = payload.vaultId || payload.storageId;
        if (!vaultId)
          return new Response("Missing vaultId in token", { status: 401 });

        // Update legacy ids with "strg" prefix
        if (vaultId.startsWith("strg_"))
          vaultId = vaultId.replace(/^strg_/, "vlt_");

        const stub = env.VAULT.getByName(vaultId);
        return stub.fetch(request);
      }

      return new Response("Not found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    },
    async scheduled(controller: ScheduledController, env: CloudflareBindings) {
      const db = database(env.HYPERDRIVE.connectionString);

      await sendCleanupEmails(db, controller.scheduledTime);
      await cleanup(db, controller.scheduledTime, env);
    },
  },
);

export { Space } from "#classes/space";
export { Vault } from "#classes/vault";
