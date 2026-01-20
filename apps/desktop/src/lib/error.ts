import i18n from "@desktop/i18n";
import { toast } from "sonner";

interface ErrorWithCode {
  code?: string;
  data?: { code?: string };
  message?: string;
}

export function showErrorToast(error: ErrorWithCode | Error | unknown) {
  console.error(error);
  const code =
    error && typeof error === "object" && "code" in error
      ? error.code
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
