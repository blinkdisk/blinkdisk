import i18n from "@desktop/i18n";
import { toast } from "sonner";

export function showErrorToast(error: any) {
  console.error(error);
  const code = error ? (error?.code ?? error?.data?.code) : undefined;
  if (code) {
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

  if (error.message) {
    toast.error(error.message);
    return;
  }

  showDefaultErrorToast();
}

export function showDefaultErrorToast() {
  toast.error(i18n.t("error:fallback.title", ""), {
    description: i18n.t("error:fallback.description", ""),
  });
}
