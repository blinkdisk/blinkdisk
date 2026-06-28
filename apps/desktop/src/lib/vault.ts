import { PROTOCOL_VAULT_URL } from "@blinkdisk/constants/app";
import { CoreError } from "@blinkdisk/utils/error";

type VaultRequestConfig = {
  params?: Record<string, boolean | number | string | null | undefined>;
};

type VaultResponse<T> = {
  data: T;
};

function appendParams(url: URL, params?: VaultRequestConfig["params"]) {
  if (!params) return;

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

function parseCoreError(data: unknown) {
  if (!data || typeof data !== "object" || !("error" in data)) return;

  const error = data.error;
  const code = getCoreErrorCode(data);

  if (error !== "mount point not found") {
    console.error("Core error:", code ? `[${code}]` : "", error);
  }

  throw new CoreError({
    message: String(error),
    ...(typeof code === "string" && { code }),
  });
}

function getCoreErrorCode(data: unknown) {
  if (!data || typeof data !== "object" || !("code" in data)) return;
  return typeof data.code === "string" ? data.code : undefined;
}

function getRequestErrorMessage(data: unknown, response: Response) {
  if (typeof data === "string") return data;

  if (data && typeof data === "object" && "message" in data) {
    const message = data.message;
    if (typeof message === "string") return message;
  }

  return `Request failed: ${response.status}`;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<T>({
  body,
  config,
  method,
  path,
  vaultId,
}: {
  body?: unknown;
  config?: VaultRequestConfig;
  method: "DELETE" | "GET" | "POST" | "PUT";
  path: string;
  vaultId?: string;
}): Promise<VaultResponse<T>> {
  const url = new URL(path, `${PROTOCOL_VAULT_URL}/`);
  appendParams(url, config?.params);

  const headers = new Headers();
  if (vaultId) headers.set("vault-id", vaultId);
  if (body !== undefined) headers.set("content-type", "application/json");

  const response = await fetch(url, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers,
    method,
  });
  const data = await parseResponse(response);

  parseCoreError(data);

  if (!response.ok) {
    const code = getCoreErrorCode(data);

    console.error("Request error:", data);
    throw new CoreError({
      message: getRequestErrorMessage(data, response),
      ...(code && { code }),
    });
  }

  return { data: data as T };
}

export function vaultApi(vaultId?: string) {
  return {
    delete: <T = unknown>(path: string, config?: VaultRequestConfig) =>
      request<T>({ config, method: "DELETE", path, vaultId }),
    get: <T = unknown>(path: string, config?: VaultRequestConfig) =>
      request<T>({ config, method: "GET", path, vaultId }),
    post: <T = unknown>(
      path: string,
      body?: unknown,
      config?: VaultRequestConfig,
    ) => request<T>({ body, config, method: "POST", path, vaultId }),
    put: <T = unknown>(
      path: string,
      body?: unknown,
      config?: VaultRequestConfig,
    ) => request<T>({ body, config, method: "PUT", path, vaultId }),
  };
}
