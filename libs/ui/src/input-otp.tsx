"use client";

import { cn } from "@utils/class";
import { OTPInput, SlotProps } from "input-otp";

export type InputOTPProps = React.ComponentProps<typeof OTPInput>;
export const InputOTP = OTPInput;

export function Slot(props: SlotProps & { className?: string }) {
  return (
    <div
      className={cn(
        "bg-card relative h-11 w-8 border border-l-0 text-lg",
        "flex items-center justify-center",
        "border-input border-y border-r first:rounded-l-md first:border-l last:rounded-r-md",
        "group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20",
        "outline-primary outline outline-0",
        { "outline-primary z-50 outline-2": props.isActive },
        props.className,
      )}
    >
      <div className="group-has-[input[data-input-otp-placeholder-shown]]:opacity-20">
        {props.char ?? props.placeholderChar}
      </div>
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  );
}

// You can emulate a fake textbox caret!
function FakeCaret() {
  return (
    <div className="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="h-8 w-px bg-white" />
    </div>
  );
}

export function FakeDash() {
  return (
    <div className="flex w-10 items-center justify-center">
      <div className="bg-input h-0.5 w-3 rounded-full" />
    </div>
  );
}
