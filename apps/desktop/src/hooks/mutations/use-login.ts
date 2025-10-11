import i18n from "@desktop/i18n";
import { authClient } from "@desktop/lib/auth";
import { showErrorToast } from "@desktop/lib/error";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZLoginType } from "@schemas/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function useLogin() {
  const { t } = useAppTranslation("auth.login");

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
    onSuccess: async (_, variables) => {
      toast.success(t("success.title"), {
        description: t("success.description", { email: variables.email }),
      });

      await navigate({
        to: "/auth/magic",
      });
    },
  });
}
