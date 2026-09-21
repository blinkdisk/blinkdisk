import { mapCoreErrorCode } from "@utils/error";
import { i18n } from "@utils/i18n";
import { toast } from "sonner";

type ErrorWithCode = {
  code?: string;
  data?: { code?: string };
  message?: string;
};

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

  if (code && toastForCode(code)) return;

  const coreCode = mapCoreErrorCode(error);
  if (coreCode && toastForCode(coreCode)) return;

  if (error instanceof Error && error.message) {
    toast.error(error.message);
    return;
  }

  showDefaultErrorToast();
}

function toastForCode(code: string): boolean {
  const title = i18n.t(`error:${code}.title`, "");
  if (title) {
    const description = i18n.t(`error:${code}.description`, "");
    toast.error(title, description ? { description } : {});
    return true;
  }

  const direct = i18n.t(`error:${code}`, "");
  if (direct) {
    toast.error(direct);
    return true;
  }

  return false;
}

function showDefaultErrorToast() {
  toast.error(i18n.t("error:fallback.title", ""), {
    description: i18n.t("error:fallback.description", ""),
  });
}
