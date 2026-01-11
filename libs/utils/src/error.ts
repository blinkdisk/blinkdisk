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
  | "MISSING_REQUIRED_VALUE";

export class CustomError extends Error {
  code: CustomErrorCode;

  constructor(code: CustomErrorCode) {
    super();
    this.code = code;
  }
}
