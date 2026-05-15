import { createWriteStream } from "node:fs";
import { rename } from "node:fs/promises";
import https from "node:https";
import type { VaultInstance } from "@electron/vault/types";
import { Cookie } from "tough-cookie";

export async function fetchVault(
  vault: VaultInstance,
  {
    method,
    path,
    search,
    data,
    variant = "renderer",
    filePath,
    raw,
  }: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    search?: Record<string, string>;
    data?: object;
    variant?: "main" | "renderer";
    filePath?: string;
    raw?: boolean;
  },
) {
  const searchString = search
    ? `?${new URLSearchParams(search).toString()}`
    : "";

  return await fetchVaultRaw(vault, {
    path: `${path}${searchString}`,
    data: JSON.stringify(data),
    method,
    variant,
    filePath,
    raw,
  });
}

export async function fetchVaultRaw(
  vault: VaultInstance,
  {
    method,
    path,
    data,
    variant = "renderer",
    filePath,
    raw,
  }: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    data?: string | undefined;
    variant?: "main" | "renderer";
    filePath?: string;
    raw?: boolean;
  },
) {
  return await new Promise((res, rej) => {
    const { address, certificate } = vault.server;
    if (!address || !certificate) throw new Error("VAULT_SERVER_NOT_READY");

    const req = https.request(
      {
        ca: [certificate],
        host: "127.0.0.1",
        port: parseInt(new URL(address).port, 10).toString(),
        method,
        path,
        headers: {
          ...(data && {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
          }),
          Authorization: `Basic ${Buffer.from(
            variant === "renderer"
              ? `kopia:${vault.server.password}`
              : `server-control:${vault.server.controlPassword}`,
          ).toString("base64")}`,
          ...(variant === "renderer"
            ? {
                cookie:
                  vault.server.cookies?.getCookieStringSync(
                    vault.server.address,
                  ) || "",
              }
            : {}),
        },
      },
      (result) => {
        const cookies = result.headers["set-cookie"];

        if (cookies?.length) {
          const parsed = cookies.map((c) => c && Cookie.parse(c));

          if (parsed?.length) {
            parsed.forEach((cookie) => {
              if (!cookie || !vault.server.cookies) return;
              vault.server.cookies.setCookieSync(cookie, address);
            });
          }
        }

        if (filePath) {
          const isAsar = filePath.endsWith(".asar");
          // Electron overrides the node:fs package for .asar files,
          // so we need to use a temporary file path.
          const tmpFilePath = isAsar ? `${filePath}.tmp` : filePath;

          const stream = createWriteStream(tmpFilePath);
          result.pipe(stream);

          stream.on("error", (e) => rej(e));
          result.on("error", (e) => rej(e));

          stream.on("finish", async () => {
            stream.close();

            try {
              if (isAsar) await rename(tmpFilePath, filePath);
              res(null);
            } catch (e) {
              rej(e);
            }
          });
        } else {
          let data = Buffer.alloc(0);

          result.on("error", (e) => rej(e));

          result.on("data", (newData: Buffer) => {
            const newBuffer = Buffer.from(newData);
            data = Buffer.concat([data, newBuffer]);
          });

          result.on("end", () => {
            if (raw) return res(data.toString("utf8"));

            try {
              const parsed = JSON.parse(data.toString("utf8"));
              res(parsed);
            } catch (e) {
              console.info(data.toString("utf8"));
              rej(e);
            }
          });
        }
      },
    );

    if (data) req.write(data);

    req.on("error", (e) => {
      rej(e);
    });

    req.end();
  });
}
