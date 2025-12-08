import i18n from "@desktop/i18n";
import { authClient } from "@desktop/lib/auth";
import { showErrorToast } from "@desktop/lib/error";
import { ZRegisterServerType, ZRegisterType } from "@schemas/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function useRegister() {
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
    onSuccess: async () => {
      await navigate({
        to: "/auth/magic",
      });
    },
  });
}
