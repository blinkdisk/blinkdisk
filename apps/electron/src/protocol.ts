import { getVault } from "@electron/vault/manage";
import { app, net, protocol } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fetchVaultRaw } from "./vault/fetch";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "blinkdiskapp",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
    },
  },
]);

export function registerProtocol() {
  protocol.handle("blinkdiskapp", async (req) => {
    const { host, pathname, search } = new URL(req.url);

    if (host === "frontend") {
      const baseDir = !app.isPackaged
        ? path.join(import.meta.dirname, "..", "frontend")
        : path.join(process.resourcesPath, "app.asar", "frontend");

      const pathToServe = path.resolve(
        baseDir,
        pathname === "/" ? "index.html" : pathname.slice(1),
      );

      const relativePath = path.relative(baseDir, pathToServe);

      const isSafe =
        relativePath &&
        !relativePath.startsWith("..") &&
        !path.isAbsolute(relativePath);

      if (!isSafe) {
        return new Response("Path not allowed", {
          status: 400,
          headers: { "content-type": "text/html" },
        });
      }

      return net.fetch(pathToFileURL(pathToServe).toString());
    } else if (host === "api") {
      return net.fetch(
        `${process.env.API_URL}${pathname}${search ? search : ""}`,
        req,
      );
    } else if (host.startsWith("vault")) {
      const vaultId = req.headers.get("vault-id") || "";
      const vault = getVault(vaultId);

      if (!vault) return new Response("Vault not found", { status: 404 });

      try {
        const data = req.body ? await new Response(req.body).text() : undefined;

        const res = await fetchVaultRaw(vault, {
          method: req.method as "GET" | "POST" | "PUT" | "DELETE",
          path: `${pathname}${search}`,
          data,
        });

        return new Response(JSON.stringify(res), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return new Response(JSON.stringify({ error: message }), {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        });
      }
    } else {
      return new Response("Host not found", {
        status: 404,
      });
    }
  });
}
