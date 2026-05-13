import { VaultInstance } from "@electron/vault/types";
import { createWriteStream } from "fs";
import { rename } from "fs/promises";
import https from "https";
import { Cookie } from "tough-cookie";

const FETCH_VAULT_LOG_PREFIX = "[fetchVault]";

function logFetchVault(message: string, data?: Record<string, unknown>) {
  console.info(`${FETCH_VAULT_LOG_PREFIX} ${message}`, data || "");
}

function warnFetchVault(message: string, data?: Record<string, unknown>) {
  console.warn(`${FETCH_VAULT_LOG_PREFIX} ${message}`, data || "");
}

function shouldLogFetchVault(path: string, filePath?: string) {
  return path.startsWith("/api/v1/restore") || !!filePath;
}

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
  const requestPath = `${path}${searchString}`;

  if (shouldLogFetchVault(requestPath, filePath)) {
    logFetchVault("request prepared", {
      method,
      path,
      search,
      variant,
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : undefined,
      dataPreview: data ? JSON.stringify(data).slice(0, 1000) : undefined,
      filePath,
      raw: !!raw,
    });
  }

  return await fetchVaultRaw(vault, {
    path: requestPath,
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
    const shouldLog = shouldLogFetchVault(path, filePath);

    if (shouldLog) {
      logFetchVault("request started", {
        method,
        path,
        variant,
        hasData: !!data,
        dataLength: data ? Buffer.byteLength(data) : 0,
        dataPreview: data ? data.slice(0, 1000) : undefined,
        filePath,
        raw: !!raw,
      });
    }

    const req = https.request(
      {
        ca: [vault.server.certificate!],
        host: "127.0.0.1",
        port: parseInt(new URL(vault.server.address).port).toString(),
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
        if (shouldLog) {
          logFetchVault("response received", {
            method,
            path,
            statusCode: result.statusCode,
            statusMessage: result.statusMessage,
            contentType: result.headers["content-type"],
            contentLength: result.headers["content-length"],
            filePath,
            raw: !!raw,
          });
        }

        if (result.statusCode && result.statusCode >= 400) {
          warnFetchVault("response status indicates failure", {
            method,
            path,
            statusCode: result.statusCode,
            statusMessage: result.statusMessage,
            filePath,
          });
        }

        const cookies = result.headers["set-cookie"];

        if (shouldLog && cookies && cookies.length) {
          logFetchVault("response set cookies", {
            method,
            path,
            count: cookies.length,
          });

          const parsed = cookies.map((c) => c && Cookie.parse(c));

          if (parsed && parsed.length) {
            parsed.forEach((cookie) => {
              if (!cookie || !vault.server.cookies) return;
              vault.server.cookies.setCookieSync(cookie, vault.server.address!);
            });
          }
        }

        if (filePath) {
          const isAsar = filePath.endsWith(".asar");
          // Electron overrides the node:fs package for .asar files,
          // so we need to use a temporary file path.
          const tmpFilePath = isAsar ? `${filePath}.tmp` : filePath;

          if (shouldLog) {
            logFetchVault("streaming response to file", {
              method,
              path,
              statusCode: result.statusCode,
              filePath,
              tmpFilePath,
              isAsar,
            });
          }

          const stream = createWriteStream(tmpFilePath);
          result.pipe(stream);

          stream.on("error", (e) => {
            warnFetchVault("file stream error", {
              method,
              path,
              filePath,
              error: e.message,
            });
            rej(e);
          });
          result.on("error", (e) => {
            warnFetchVault("response stream error", {
              method,
              path,
              filePath,
              error: e.message,
            });
            rej(e);
          });

          stream.on("finish", async () => {
            stream.close();

            try {
              if (isAsar) await rename(tmpFilePath, filePath);
              if (shouldLog) {
                logFetchVault("file stream complete", {
                  method,
                  path,
                  statusCode: result.statusCode,
                  filePath,
                  tmpFilePath,
                });
              }
              res(null);
            } catch (e) {
              warnFetchVault("file stream finalization failed", {
                method,
                path,
                filePath,
                error: e instanceof Error ? e.message : String(e),
              });
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
            const text = data.toString("utf8");
            if (shouldLog) {
              logFetchVault("buffered response complete", {
                method,
                path,
                statusCode: result.statusCode,
                byteLength: data.byteLength,
                raw: !!raw,
                preview: text.slice(0, 500),
              });
            }

            if (raw) return res(text);

            try {
              const parsed = JSON.parse(text);
              res(parsed);
            } catch (e) {
              warnFetchVault("failed to parse JSON response", {
                method,
                path,
                statusCode: result.statusCode,
                preview: text.slice(0, 1000),
                error: e instanceof Error ? e.message : String(e),
              });
              rej(e);
            }
          });
        }
      },
    );

    if (data) req.write(data);

    req.on("error", (e) => {
      warnFetchVault("request error", {
        method,
        path,
        filePath,
        error: e.message,
      });
      rej(e);
    });

    req.end();
  });
}
