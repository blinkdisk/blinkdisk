import { useLogin } from "#hooks/mutations/use-login";
import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { ZLogin } from "@blinkdisk/schemas/auth";

export function useLoginForm() {
  const { mutateAsync } = useLogin();

  return useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: ZLogin,
    },
    onSubmit: async ({ value }) => await mutateAsync(value),
  });
}
