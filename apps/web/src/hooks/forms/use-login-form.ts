import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { ZLogin } from "@blinkdisk/schemas/auth";
import { useLogin } from "@web/hooks/mutations/use-login";

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
