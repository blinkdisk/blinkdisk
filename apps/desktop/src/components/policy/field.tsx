import { useFieldContext, useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Switch } from "@blinkdisk/ui/switch";
import { cn } from "@blinkdisk/utils/class";
import { PolicyContext } from "@desktop/components/policy/context";
import {
  getPolicyDefinedFieldPath,
  type PolicyDefinedFields,
  setPolicyFieldDefined,
} from "@desktop/hooks/forms/use-policy-form";
import { useContext } from "react";

type PolicyFieldProps = {
  children: React.ReactNode;
};

export function PolicyField({ children }: PolicyFieldProps) {
  const { t } = useAppTranslation("policy.page");
  const field = useFieldContext();
  const { inherited } = useContext(PolicyContext);
  const definedFieldPath = getPolicyDefinedFieldPath(field.name);

  const definedFields = useStore(field.form.store, (state) =>
    definedFieldPath
      ? (state.values.definedFields as PolicyDefinedFields | undefined)?.[
          definedFieldPath.section
        ]
      : undefined,
  );

  if (!inherited || !definedFieldPath) return children;

  const overriding = definedFields?.includes(definedFieldPath.field) || false;

  const setOverriding = (to: boolean) => {
    setPolicyFieldDefined({
      formApi: field.form,
      section: definedFieldPath.section,
      field: definedFieldPath.field,
      defined: to,
    });
  };

  return (
    <div
      className={cn(
        "border-l-2 pl-4 transition-colors",
        overriding ? "border-primary/40" : "border-border",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Switch
          size="sm"
          checked={overriding}
          onCheckedChange={setOverriding}
          aria-label={
            overriding ? t("override.custom") : t("override.inherited")
          }
        />
        <button
          type="button"
          onClick={() => setOverriding(!overriding)}
          className={cn(
            "select-none text-xs font-medium transition-colors",
            overriding ? "text-primary" : "text-muted-foreground",
          )}
        >
          {overriding ? t("override.custom") : t("override.inherited")}
        </button>
      </div>
      <div className={cn("transition-opacity", !overriding && "opacity-60")}>
        {children}
      </div>
    </div>
  );
}
