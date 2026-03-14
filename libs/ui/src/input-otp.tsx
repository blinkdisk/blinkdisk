import { OTPInput, OTPInputContext } from "input-otp";
import * as React from "react";

import { cn } from "@blinkdisk/utils/class";
import { MinusIcon } from "lucide-react";

export type InputOTPProps = React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
};

function InputOTP({ className, containerClassName, ...props }: InputOTPProps) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex items-center has-disabled:opacity-50",
        containerClassName,
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive has-aria-invalid:ring-3 flex items-center rounded-lg",
        className,
      )}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  char: charProp,
  hasFakeCaret: hasFakeCaretProp,
  isActive: isActiveProp,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
  char?: string;
  hasFakeCaret?: boolean;
  isActive?: boolean;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const slot = inputOTPContext?.slots?.[index];
  const char = charProp ?? slot?.char;
  const hasFakeCaret = hasFakeCaretProp ?? slot?.hasFakeCaret;
  const isActive = isActiveProp ?? slot?.isActive;

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "dark:bg-input/30 border-input data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive data-[active=true]:ring-3 relative flex size-8 h-11 items-center justify-center border-y border-r text-sm outline-none transition-all first:rounded-l-lg first:border-l last:rounded-r-lg data-[active=true]:z-10",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
