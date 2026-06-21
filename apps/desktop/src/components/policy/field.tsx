import { useFieldContext, useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Switch } from "@blinkdisk/ui/switch";
import { cn } from "@blinkdisk/utils/class";
import { PolicyContext } from "@desktop/components/policy/context";
import { useContext } from "react";

type PolicyFieldProps = {
  children: React.ReactNode;
};

export function PolicyField({ children }: PolicyFieldProps) {
  const { t } = useAppTranslation("policy.page");
  const field = useFieldContext();
  const { inherited } = useContext(PolicyContext);

  const definedFields = useStore(
    field.form.store,
    (state) => state.values.definedFields as string[] | undefined,
  );

  if (!inherited) return children;

  const overriding = definedFields?.includes(field.name) || false;

  const setOverriding = (to: boolean) => {
    const filtered = (definedFields || []).filter((v) => v !== field.name);
    field.form.setFieldValue(
      "definedFields",
      to ? [...filtered, field.name] : filtered,
    );
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
