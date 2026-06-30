import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

export function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}
