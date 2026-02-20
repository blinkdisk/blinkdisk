import type { BackupTool } from "@config/comparison";
import AcronisPricingCalculator from "./AcronisPricingCalculator";
import BackblazePricingCalculator from "./BackblazePricingCalculator";
import BlinkDiskPricingCalculator from "./BlinkDiskPricingCalculator";
import CarbonitePricingCalculator from "./CarbonitePricingCalculator";
import CrashPlanPricingCalculator from "./CrashPlanPricingCalculator";
import IDrivePricingCalculator from "./IDrivePricingCalculator";

type Props = {
  tool: BackupTool;
};

const calculators: Record<string, React.ComponentType> = {
  acronis: AcronisPricingCalculator,
  blinkdisk: BlinkDiskPricingCalculator,
  backblaze: BackblazePricingCalculator,
  carbonite: CarbonitePricingCalculator,
  crashplan: CrashPlanPricingCalculator,
  idrive: IDrivePricingCalculator,
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
