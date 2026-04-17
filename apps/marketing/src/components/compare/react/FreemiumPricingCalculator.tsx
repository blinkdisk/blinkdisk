import { AlertTriangleIcon, CheckIcon } from "lucide-react";

export default function FreemiumPricingCalculator() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-3xl font-bold">Free</p>

        <ul className="mt-4 flex flex-col gap-2">
          <li className="flex items-start gap-2 text-sm">
            <CheckIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span>Some features available at no cost</span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <CheckIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span>Pay for storage</span>
          </li>
        </ul>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" />
          <p className="text-xs text-amber-900 dark:text-amber-200">
            Some features require a paid upgrade.
          </p>
        </div>
      </div>
    </div>
  );
}
