import {
  ENDORSELY_HEADER,
  LANGUAGE_HEADER,
  TIMEZONE_HEADER,
} from "@blinkdisk/constants/header";
import { LanguageCode } from "@blinkdisk/constants/language";
import { ZMagicCodeType } from "@blinkdisk/schemas/auth";
import { showErrorToast } from "@blinkdisk/utils/error";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import i18n from "@web/i18n";
import { authClient } from "@web/lib/auth";
import { usePostHog } from "posthog-js/react";

export function useMagicCode() {
  const posthog = usePostHog();
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["auth", "magic"],
    mutationFn: async (values: ZMagicCodeType) => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const { data, error } = await authClient.magicLink.verify({
        query: {
          token: values.code,
        },
        fetchOptions: {
          query: search,
          headers: {
            ...("endorsely_referral" in window && window.endorsely_referral
              ? {
                  [ENDORSELY_HEADER]: window.endorsely_referral as string,
                }
              : {}),
            ...(timeZone ? { [TIMEZONE_HEADER]: timeZone } : {}),
            [LANGUAGE_HEADER]: i18n.language as LanguageCode,
          },
        },
      });

      if (error && "statusText" in error && error.statusText === "Not Found")
        throw new Error("INVALID_CODE");
      if (error) throw error;

      return data;
    },
    onError: (error) => {
      if (error.message === "INVALID_CODE") return error;
      showErrorToast(error);
    },
    onSuccess: async (res) => {
      // End the last session
      posthog.reset();
      // Start a new session
      posthog.identify(res.user.id);

      await navigate({
        to: "/auth/success",
        search,
      });
    },
  });
}
