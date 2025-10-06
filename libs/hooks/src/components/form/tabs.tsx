import { FormDisabledContext, useFieldContext } from "@hooks/use-app-form";
import { LabelContainer, LabelContainerProps } from "@ui/label";
import { TabsList, TabsProps, Tabs as TabsRoot, TabsTrigger } from "@ui/tabs";
import React, { ReactNode, useContext } from "react";

const Tabs = React.forwardRef<
  HTMLDivElement,
  TabsProps & { label: LabelContainerProps } & {
    items: { value: string; label: ReactNode }[];
  }
>(({ className, onValueChange, label, items, ...props }, ref) => {
  const field = useFieldContext<string>();
  const disabledContext = useContext(FormDisabledContext);

  return (
    <LabelContainer
      {...label}
      errors={field.state.meta.errors}
      name={field.name}
    >
      <TabsRoot
        {...props}
        ref={ref}
        value={field.state.value}
        onValueChange={(to) => {
          field.setValue(to);
          onValueChange?.(to);
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
    </LabelContainer>
  );
});

Tabs.displayName = "Tabs";

export { Tabs };
