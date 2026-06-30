import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

export function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}
