import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { ZCreateProfileType } from "@schemas/profile";
import { useMutation } from "@tanstack/react-query";

export function useCreateProfile() {
  return useMutation({
    mutationKey: ["profile", "create"],
    mutationFn: async (values: ZCreateProfileType) => {
      return await trpc.profile.create.mutate(values);
    },
    onError: showErrorToast,
  });
}
