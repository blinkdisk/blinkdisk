import { Button } from "@blinkdisk/ui/button";
import { FormDisabledContext, useFormContext } from "@forms/form-context";
import type { ComponentProps, Ref } from "react";
import { use } from "react";

type SubmitProps = ComponentProps<typeof Button> & {
  ref?: Ref<HTMLButtonElement>;
};

function Submit({ disabled, ref, ...props }: SubmitProps) {
  const form = useFormContext();
  const disabledContext = use(FormDisabledContext);

  return (
    <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
      {([isSubmitting, canSubmit]) => (
        <Button
          type="submit"
          className="w-full"
          disabled={disabledContext || !canSubmit || disabled}
          loading={isSubmitting}
          {...props}
          ref={ref}
        />
      )}
    </form.Subscribe>
  );
}

export { Submit };
