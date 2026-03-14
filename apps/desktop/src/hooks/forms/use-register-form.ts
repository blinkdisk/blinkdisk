import { useRegister } from "@desktop/hooks/mutations/use-register";
import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { ZRegisterForm, ZRegisterFormType } from "@blinkdisk/schemas/auth";

type RegisterFormProps = {
  defaultValues?: Partial<ZRegisterFormType>;
};

export function useRegisterForm({ defaultValues }: RegisterFormProps = {}) {
  const { mutateAsync } = useRegister();

  return useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      terms: false,
      ...(defaultValues ?? {}),
    },
    validators: {
      onSubmit: ZRegisterForm,
    },
    onSubmit: async ({ value }) => await mutateAsync(value),
  });
}
