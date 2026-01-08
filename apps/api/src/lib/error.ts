export type CustomErrorCode =
  | "VERIFICATION_CODE_INVALID"
  | "PROFILE_NOT_FOUND"
  | "STORAGE_NOT_FOUND"
  | "VAULT_NOT_FOUND"
  | "FOLDER_NOT_FOUND"
  | "PROVIDER_NOT_FOUND"
  | "SPACE_NOT_FOUND"
  | "PRICE_NOT_FOUND"
  | "SUBSCRIPTION_EXISTS"
  | "SUBSCRIPTION_NOT_FOUND"
  | "NOT_ALLOWED";

export class CustomError extends Error {
  code: CustomErrorCode;

  constructor(code: CustomErrorCode) {
    super();
    this.code = code;
  }
}
