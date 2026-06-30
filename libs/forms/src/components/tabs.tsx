import {
  DynamicField,
  type DynamicFieldProps,
} from "@blinkdisk/components/dynamic-field";
import {
  TabsList,
  type TabsProps,
  Tabs as TabsRoot,
  TabsTrigger,
} from "@blinkdisk/ui/tabs";
import { FormDisabledContext, useFieldContext } from "@forms/form-context";
import type { ReactNode, Ref } from "react";
import { use } from "react";

type TabsFieldProps = TabsProps & {
  label: DynamicFieldProps;
  ref?: Ref<HTMLDivElement>;
} & {
  items: { value: string; label: ReactNode }[];
};

function Tabs({
  className,
  onValueChange,
  label,
  items,
  ref,
  ...props
}: TabsFieldProps) {
  const field = useFieldContext<string>();
  const disabledContext = use(FormDisabledContext);

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
}

export { Tabs };
