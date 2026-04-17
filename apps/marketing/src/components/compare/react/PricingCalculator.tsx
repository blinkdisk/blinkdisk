import type { BackupTool } from "@blinkdisk/constants/comparison";
import AcronisPricingCalculator from "@marketing/components/compare/react/AcronisPricingCalculator";
import BackblazePricingCalculator from "@marketing/components/compare/react/BackblazePricingCalculator";
import BlinkDiskPricingCalculator from "@marketing/components/compare/react/BlinkDiskPricingCalculator";
import CarbonitePricingCalculator from "@marketing/components/compare/react/CarbonitePricingCalculator";
import CrashPlanPricingCalculator from "@marketing/components/compare/react/CrashPlanPricingCalculator";
import EaseUSTodoBackupPricingCalculator from "@marketing/components/compare/react/EaseUSTodoBackupPricingCalculator";
import IDrivePricingCalculator from "@marketing/components/compare/react/IDrivePricingCalculator";

type Props = {
  tool: BackupTool;
};

const calculators: Record<string, React.ComponentType> = {
  blinkdisk: BlinkDiskPricingCalculator,
  backblaze: BackblazePricingCalculator,
  carbonite: CarbonitePricingCalculator,
  crashplan: CrashPlanPricingCalculator,
  "acronis-true-image": AcronisPricingCalculator,
  "easeus-todo-backup": EaseUSTodoBackupPricingCalculator,
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
