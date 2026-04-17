import { CheckIcon } from "lucide-react";

export default function FreePricingCalculator() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-3xl font-bold">Free</p>

        <ul className="mt-4 flex flex-col gap-2">
          <li className="flex items-start gap-2 text-sm">
            <CheckIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span>All features included</span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <CheckIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span>Only pay for storage</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
