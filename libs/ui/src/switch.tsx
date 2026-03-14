import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@blinkdisk/utils/class";

export type SwitchProps = SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
};

function Switch({ className, size = "default", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-unchecked:bg-input/80 focus-visible:ring-3 aria-invalid:ring-3 group/switch data-disabled:cursor-not-allowed data-disabled:opacity-50 peer relative inline-flex shrink-0 items-center rounded-full border border-transparent outline-none transition-all after:absolute after:-inset-x-3 after:-inset-y-2 data-[size=default]:h-[22px] data-[size=sm]:h-[14px] data-[size=default]:w-[40px] data-[size=sm]:w-[24px]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-3"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
