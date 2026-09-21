export type CustomErrorCode =
  | "VERIFICATION_CODE_INVALID"
  | "VAULT_NOT_FOUND"
  | "VAULT_ALREADY_EXISTS"
  | "FOLDER_NOT_FOUND"
  | "PROVIDER_NOT_FOUND"
  | "SPACE_NOT_FOUND"
  | "PRICE_NOT_FOUND"
  | "SUBSCRIPTION_EXISTS"
  | "SUBSCRIPTION_NOT_FOUND"
  | "NO_STORAGE"
  | "NOT_ALLOWED"
  | "MISSING_REQUIRED_VALUE"
  | "INVALID_ID"
  | "INVALID_PASSWORD"
  | "INCORRECT_VAULT"
  | "INCORRECT_CONFIG"
  | "CONFIG_NOT_FOUND"
  | "STORAGE_UNREACHABLE"
  | "VAULT_SERVER_UNAVAILABLE";

// Stable ASCII markers the core backup engine failures carry. The
// renderer matches these to translated error codes, so they must survive
// being wrapped in an Electron IPC error message.
export const VAULT_SERVER_UNAVAILABLE_MARKER = "VAULT_SERVER_UNAVAILABLE";
export const VAULT_REQUEST_TIMEOUT_MARKER = "VAULT_REQUEST_TIMEOUT";

export class CustomError extends Error {
  code: CustomErrorCode;
  variables?: Record<string, unknown>;

  constructor(code: CustomErrorCode, variables?: Record<string, unknown>) {
    super();
    this.code = code;
    this.variables = variables;
  }
}

export class CoreError extends Error {
  code?: string;

  constructor({ code, message }: { code?: string; message: string }) {
    super(message);
    this.code = code;
    this.message = message;
  }
}

type ErrorDataCode = {
  data?: {
    code?: unknown;
  };
};

export function getErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return;

  if ("code" in error && typeof error.code === "string") return error.code;
  const dataCode = "data" in error ? (error as ErrorDataCode).data?.code : null;
  if (typeof dataCode === "string") return dataCode;
}

export function extractErrorMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object") {
    const fields = error as { error?: unknown; message?: unknown };
    if (typeof fields.error === "string") return fields.error;
    if (typeof fields.message === "string") return fields.message;
  }
  return "";
}

const CORE_ERROR_PATTERNS: { code: CustomErrorCode; markers: string[] }[] = [
  {
    code: "VAULT_SERVER_UNAVAILABLE",
    markers: [VAULT_SERVER_UNAVAILABLE_MARKER.toLowerCase()],
  },
  {
    code: "STORAGE_UNREACHABLE",
    markers: [
      VAULT_REQUEST_TIMEOUT_MARKER.toLowerCase(),
      "cannot access storage path",
      "getfileattributesex",
      "no such host",
      "connection refused",
      "network is unreachable",
      "i/o timeout",
      "dial tcp",
      "handshake failed",
    ],
  },
];

// Maps a raw core backup engine error to a translated error code. The
// engine returns untranslated Go/OS strings, so this matches on stable
// English markers to give the user a real message.
export function mapCoreErrorCode(error: unknown): CustomErrorCode | undefined {
  const message = extractErrorMessage(error).toLowerCase();
  if (!message) return undefined;

  for (const { code, markers } of CORE_ERROR_PATTERNS) {
    if (markers.some((marker) => message.includes(marker))) return code;
  }

  return undefined;
}
