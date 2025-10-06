import i18n from "@desktop/i18n";
import { authClient } from "@desktop/lib/auth";
import { showErrorToast } from "@desktop/lib/error";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZRegisterServerType, ZRegisterType } from "@schemas/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function useRegister() {
  const { t } = useAppTranslation("auth.register");

  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: async (values: ZRegisterType) => {
      const { data, error } = await authClient.signIn.magicLink(
        {
          name: `${values.firstName.replace(/\s+/g, "")} ${values.lastName.replace(
            /\s+/g,
            "",
          )}`,
          email: values.email,
          // @ts-expect-error Additional fields are inferred incorrectly.
        } satisfies ZRegisterServerType,
        {
          headers: {
            "X-BlinkDisk-Language": i18n.language,
          },
        },
      );

      if (error) throw error;

      return data;
    },
    onError: showErrorToast,
    onSuccess: (_, variables) => {
      toast.success(t("success.title"), {
        description: t("success.description", { email: variables.email }),
      });

      navigate({
        to: "/auth/magic",
      });
    },
  });
}
