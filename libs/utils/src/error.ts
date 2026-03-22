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
  | "NOT_ALLOWED"
  | "MISSING_REQUIRED_VALUE"
  | "INVALID_ID"
  | "INVALID_PASSWORD"
  | "INCORRECT_VAULT";

export class CustomError extends Error {
  code: CustomErrorCode;

  constructor(code: CustomErrorCode) {
    super();
    this.code = code;
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
