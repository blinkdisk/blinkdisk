import { i18n } from "@utils/i18n";
import { toast } from "sonner";

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

interface ErrorWithCode {
  code?: string;
  data?: { code?: string };
  message?: string;
}

type ErrorDataCode = {
  data?: { code?: string };
};

export function showErrorToast(
  error: ErrorWithCode | Error | ErrorDataCode | unknown,
) {
  const code =
    error && typeof error === "object"
      ? "code" in error && typeof error.code === "string"
        ? error.code
        : error && "data" in error
          ? (error as ErrorDataCode).data?.code
          : undefined
      : undefined;
  if (code && typeof code === "string") {
    const titleTranslation = i18n.t(`error:${code}.title`, "");

    if (titleTranslation) {
      const description = i18n.t(`error:${code}.description`, "");

      toast.error(titleTranslation, {
        ...(description ? { description } : {}),
      });

      return;
    }

    const directTranslation = i18n.t(`error:${code}`, "");
    if (directTranslation) {
      toast.error(directTranslation);
      return;
    }
  }

  if (error instanceof Error && error.message) {
    toast.error(error.message);
    return;
  }

  showDefaultErrorToast();
}

function showDefaultErrorToast() {
  toast.error(i18n.t("error:fallback.title", ""), {
    description: i18n.t("error:fallback.description", ""),
  });
}
