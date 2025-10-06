import i18n from "@desktop/i18n";
import { authClient } from "@desktop/lib/auth";
import { showErrorToast } from "@desktop/lib/error";
import { ZLoginType } from "@schemas/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async (values: ZLoginType) => {
      const { data, error } = await authClient.signIn.magicLink(
        {
          email: values.email,
        },
        {
          headers: {
            "X-BlinkDisk-Language": i18n.language,
          },
        },
      );

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
      });
    },
  });
}
