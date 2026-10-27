import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

export const root = fileURLToPath(new URL("../../", import.meta.url));
export const localPath = `${root}.env.local`;
export const local = existsSync(localPath)
  ? parseEnv(readFileSync(localPath, "utf8"))
  : {};
export const cmsUrl = process.env.DIRECTUS_URL ?? local.DIRECTUS_URL;
const token = process.env.DIRECTUS_ADMIN_TOKEN;
if (!cmsUrl || !token)
  throw new Error(
    "Set DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN. Never commit these values.",
  );
if (
  new URL(cmsUrl).protocol !== "https:" &&
  !["localhost", "127.0.0.1"].includes(new URL(cmsUrl).hostname)
)
  throw new Error("Directus must use HTTPS outside local development.");
export async function api(path, { method = "GET", data, body } = {}) {
  const response = await fetch(new URL(path, cmsUrl), {
    method,
    redirect: "error",
    signal: AbortSignal.timeout(60000),
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "BlinkDisk-CMS-Setup/1.0",
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    body: data ? JSON.stringify(data) : body,
  });
  if (!response.ok) {
    let codes = "";
    try {
      codes =
        (await response.json()).errors
          ?.map((error) =>
            [
              error.extensions?.code,
              error.extensions?.field,
              error.extensions?.type,
            ]
              .filter(Boolean)
              .join(":"),
          )
          .join(", ") ?? "";
    } catch {
      /* Do not log error bodies that may contain credentials. */
    }
    throw new Error(
      method +
        " " +
        path.split("?")[0] +
        " failed: " +
        response.status +
        " " +
        codes,
    );
  }
  return response.status === 204 ? null : (await response.json()).data;
}
export function query(values) {
  return new URLSearchParams(
    Object.entries(values).map(([key, value]) => [
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    ]),
  ).toString();
}
export async function find(collection, filter) {
  return (await api(`/${collection}?${query({ filter, limit: 1 })}`))[0];
}
export function saveLocal(values) {
  const combined = { ...local, ...values };
  writeFileSync(
    localPath,
    `${Object.entries(combined)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join("\n")}\n`,
    { mode: 0o600 },
  );
  chmodSync(localPath, 0o600);
  const runtimePath = `${root}.dev.vars`;
  const runtime = existsSync(runtimePath)
    ? parseEnv(readFileSync(runtimePath, "utf8"))
    : {};
  for (const name of ["DIRECTUS_URL", "DIRECTUS_TOKEN", "BLOG_PREVIEW_SECRET"])
    runtime[name] = combined[name];
  writeFileSync(
    runtimePath,
    `${Object.entries(runtime)
      .map(([name, value]) => `${name}=${JSON.stringify(value)}`)
      .join("\n")}\n`,
    { mode: 0o600 },
  );
  chmodSync(runtimePath, 0o600);
}
