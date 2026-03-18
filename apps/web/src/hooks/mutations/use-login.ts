import { LANGUAGE_HEADER } from "@blinkdisk/constants/header";
import { ZLoginType } from "@blinkdisk/schemas/auth";
import { showErrorToast } from "@blinkdisk/utils/error";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import i18n from "@web/i18n";
import { authClient } from "@web/lib/auth";

export function useLogin() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async (values: ZLoginType) => {
      const { data, error } = await authClient.signIn.magicLink({
        email: values.email,
        fetchOptions: {
          query: search,
          headers: {
            [LANGUAGE_HEADER]: i18n.language,
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onError: async (error, variables) => {
      if (error.message === "ACCOUNT_NOT_FOUND") {
        await navigate({
          to: "/auth/register",
          search: {
            email: variables.email,
          },
        });

        return;
      }

      showErrorToast(error);
    },
    onSuccess: async () => {
      await navigate({
        to: "/auth/magic",
        search,
      });
    },
  });
}
