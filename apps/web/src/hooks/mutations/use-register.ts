import { LANGUAGE_HEADER } from "@blinkdisk/constants/header";
import { ZRegisterServerType, ZRegisterType } from "@blinkdisk/schemas/auth";
import { showErrorToast } from "@blinkdisk/utils/error";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { i18n } from "@web/i18n";
import { authClient } from "@web/lib/auth";

export function useRegister() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: async (values: ZRegisterType) => {
      const { data, error } = await authClient.signIn.magicLink({
        ...({
          name: `${values.firstName.replace(/\s+/g, "")} ${values.lastName.replace(
            /\s+/g,
            "",
          )}`,
          email: values.email,
          // @ts-expect-error Additional fields are inferred incorrectly.
        } satisfies ZRegisterServerType),
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
    onError: showErrorToast,
    onSuccess: async () => {
      await navigate({
        to: "/auth/magic",
        search,
      });
    },
  });
}
