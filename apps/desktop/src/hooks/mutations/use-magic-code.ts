import { LanguageCode } from "@config/language";
import { useAuth } from "@desktop/hooks/use-auth";
import i18n from "@desktop/i18n";
import { authClient } from "@desktop/lib/auth";
import { showErrorToast } from "@desktop/lib/error";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZMagicCodeType } from "@schemas/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";

export function useMagicCode() {
  const { t } = useAppTranslation("auth.magic");
  const { setAuthenticated, accountChanged } = useAuth();

  const navigate = useNavigate();
  const posthog = usePostHog();

  return useMutation({
    mutationKey: ["auth", "magic"],
    mutationFn: async (values: ZMagicCodeType) => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const { data, error } = await authClient.magicLink.verify({
        query: {
          token: values.code,
        },
      });

      if (error && "statusText" in error && error.statusText === "Not Found")
        throw new Error("INVALID_CODE");
      if (error) throw error;

      await authClient.updateUser({
        language: i18n.language as LanguageCode,
        ...(timeZone && { timeZone }),
      });

      return data;
    },
    onError: (error) => {
      if (error.message === "INVALID_CODE") return error;
      showErrorToast(error);
    },
    onSuccess: async (res) => {
      posthog.identify(res.user.id);

      setAuthenticated(true);

      await accountChanged();
      await navigate({ to: "/" });
    },
  });
}
