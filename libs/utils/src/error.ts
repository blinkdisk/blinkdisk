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
  | "CONFIG_NOT_FOUND";

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
    code?: string;
  };
};

export function getErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return;

  if ("code" in error && typeof error.code === "string") return error.code;
  if ("data" in error) return (error as ErrorDataCode).data?.code;
}
