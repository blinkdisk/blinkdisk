import { Button } from "@blinkdisk/ui/button";
import { FormDisabledContext, useFormContext } from "@forms/use-app-form";
import React, { useContext } from "react";

const Submit = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ disabled, ...props }, ref) => {
  const form = useFormContext();
  const disabledContext = useContext(FormDisabledContext);

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
});

Submit.displayName = "Submit";

export { Submit };
