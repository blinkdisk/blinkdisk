import { useMagicCode } from "#hooks/mutations/use-magic-code";
import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { ZMagicCode } from "@blinkdisk/schemas/auth";

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
