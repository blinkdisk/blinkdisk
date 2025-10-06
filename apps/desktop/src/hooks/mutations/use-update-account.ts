import { authClient } from "@desktop/lib/auth";
import { showErrorToast } from "@desktop/lib/error";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZUpdateUserType } from "@schemas/settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateAccount(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("settings.account");

  return useMutation({
    mutationKey: ["account", "details"],
    mutationFn: async (values: ZUpdateUserType) => {
      const { data, error } = await authClient.updateUser({
        name: `${values.firstName.replace(/\s+/g, "")} ${values.lastName.replace(
          /\s+/g,
          "",
        )}`,
      });

      if (error) throw error;
      return data;
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["account"],
      });

      toast.success(t("success.title"), {
        description: t("success.description"),
      });

      onSuccess?.();
    },
  });
}
