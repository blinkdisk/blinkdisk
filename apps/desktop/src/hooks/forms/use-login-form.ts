import { useLogin } from "#hooks/mutations/use-login";
import { useAppForm } from "@hooks/use-app-form";
import { ZLogin } from "@schemas/auth";

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
