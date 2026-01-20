import { useMagicCode } from "@desktop/hooks/mutations/use-magic-code";
import { useAppForm } from "@hooks/use-app-form";
import { ZMagicCode } from "@schemas/auth";

export function useMagicCodeForm() {
  const { mutateAsync } = useMagicCode();

  return useAppForm({
    defaultValues: {
      code: "",
    },
    validators: {
      onSubmit: ZMagicCode,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutateAsync(value);
      } catch (error) {
        formApi.setErrorMap({
          onSubmit: {
            // @ts-expect-error error type
            code: error.message,
          },
        });
      }
    },
  });
}
