import type { BackupTool } from "@config/comparison";
import BackblazePricingCalculator from "./BackblazePricingCalculator";
import BlinkDiskPricingCalculator from "./BlinkDiskPricingCalculator";
import CarbonitePricingCalculator from "./CarbonitePricingCalculator";
import CrashPlanPricingCalculator from "./CrashPlanPricingCalculator";

type Props = {
  tool: BackupTool;
};

const calculators: Record<string, React.ComponentType> = {
  blinkdisk: BlinkDiskPricingCalculator,
  backblaze: BackblazePricingCalculator,
  carbonite: CarbonitePricingCalculator,
  crashplan: CrashPlanPricingCalculator,
};

export default function PricingCalculator({ tool }: Props) {
  const Calculator = calculators[tool.slug];

  if (!Calculator) {
    return null;
  }

  return <Calculator />;
}

export function hasCalculator(slug: string): boolean {
  return slug in calculators;
}
