import { getErrorCode, mapCoreErrorCode } from "@utils/error";
import { i18n } from "@utils/i18n";
import { toast } from "sonner";

export function showErrorToast(error: unknown) {
  const code = getErrorCode(error);

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
