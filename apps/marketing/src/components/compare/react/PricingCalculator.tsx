import type { BackupTool } from "@config/comparison";
import BackblazePricingCalculator from "./BackblazePricingCalculator";
import BlinkDiskPricingCalculator from "./BlinkDiskPricingCalculator";
import CarbonitePricingCalculator from "./CarbonitePricingCalculator";

type Props = {
  tool: BackupTool;
};

const calculators: Record<string, React.ComponentType> = {
  blinkdisk: BlinkDiskPricingCalculator,
  backblaze: BackblazePricingCalculator,
  carbonite: CarbonitePricingCalculator,
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
