import { PolicyContext } from "@desktop/components/policy/context";
import { useFieldContext, useStore } from "@hooks/use-app-form";
import { Checkbox } from "@ui/checkbox";
import { cn } from "@utils/class";
import { useContext } from "react";

type PolicyFieldProps = {
  children: React.ReactNode;
};

export function PolicyField({ children }: PolicyFieldProps) {
  const field = useFieldContext();
  const { level } = useContext(PolicyContext);

  const definedFields = useStore(
    field.form.store,
    (state) => state.values.definedFields as string[] | undefined,
  );

  if (level !== "FOLDER") return children;
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`${field.name}-checkbox`}
          checked={definedFields?.includes(field.name) || false}
          onCheckedChange={(to) => {
            const filtered = (definedFields || []).filter(
              (v: string) => v !== field.name,
            );

            field.form.setFieldValue(
              "definedFields",
              to ? [...filtered, field.name] : filtered,
            );
          }}
        />
        <label
          htmlFor={`${field.name}-checkbox`}
          className={cn(
            "select-none text-sm",
            definedFields?.includes(field.name)
              ? "text-primary"
              : "text-muted-foreground",
          )}
        >
          {/* TODO: Translate keys */}
          {definedFields?.includes(field.name) ? "Defined" : "Fallback"}
        </label>
      </div>
      <div className="w-full pl-6">{children}</div>
    </div>
  );
}
