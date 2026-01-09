import { cleanup, sendCleanupEmails } from "@cloud/utils/cleanup";
import { database } from "@db/index";
import { verifyServiceToken } from "@utils/token";

export default {
  async fetch(request: Request, env: CloudflareBindings): Promise<Response> {
    const url = new URL(request.url);

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
        // The dotenv parser somtimes leaves a trailing backslash
        env.CLOUD_JWT_PUBLIC_KEY.replace(/\\+$/gm, ""),
      );
      if (!payload) return new Response("Invalid token", { status: 401 });

      let stub = env.STORAGE.getByName(payload.storageId);
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
};

export { Space } from "@cloud/classes/space";
export { Storage } from "@cloud/classes/storage";
export { Vault } from "@cloud/classes/vault";
