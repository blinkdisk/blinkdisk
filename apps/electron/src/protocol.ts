import {
  INTERNAL_SCHEME,
  PROTOCOL_API_NS,
  PROTOCOL_FRONTEND_NS,
  PROTOCOL_VAULT_NS,
} from "@blinkdisk/config/app";
import { getVault } from "@electron/vault/manage";
import { app, net, protocol } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fetchVaultRaw } from "./vault/fetch";

export function registerProtcol() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: "sentry-ipc",
      privileges: { bypassCSP: true, corsEnabled: true, supportFetchAPI: true },
    },
    {
      scheme: INTERNAL_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
      },
    },
  ]);
}

export function listenProtocol() {
  protocol.handle(INTERNAL_SCHEME, async (req) => {
    const { host, pathname, search } = new URL(req.url);

    if (host === PROTOCOL_FRONTEND_NS) {
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
    } else if (host === PROTOCOL_API_NS) {
      return net.fetch(
        `${process.env.API_URL}${pathname}${search ? search : ""}`,
        req,
      );
    } else if (host === PROTOCOL_VAULT_NS) {
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
