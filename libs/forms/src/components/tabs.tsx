import { DynamicField, DynamicFieldProps } from "@blinkdisk/ui/dynamic-field";
import {
  TabsList,
  TabsProps,
  Tabs as TabsRoot,
  TabsTrigger,
} from "@blinkdisk/ui/tabs";
import { FormDisabledContext, useFieldContext } from "@forms/use-app-form";
import React, { ReactNode, useContext } from "react";

const Tabs = React.forwardRef<
  HTMLDivElement,
  TabsProps & { label: DynamicFieldProps } & {
    items: { value: string; label: ReactNode }[];
  }
>(({ className, onValueChange, label, items, ...props }, ref) => {
  const field = useFieldContext<string>();
  const disabledContext = useContext(FormDisabledContext);

  return (
    <DynamicField {...label} errors={field.state.meta.errors} name={field.name}>
      <TabsRoot
        {...props}
        ref={ref}
        value={field.state.value}
        onValueChange={(to, e) => {
          field.setValue(to);
          onValueChange?.(to, e);
        }}
      >
        <TabsList className={className}>
          {items.map(({ value, label }) => (
            <TabsTrigger value={value} key={value} disabled={disabledContext}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </TabsRoot>
    </DynamicField>
  );
});

Tabs.displayName = "Tabs";

export { Tabs };
