import type { BackupTool } from "@blinkdisk/constants/comparison";
import AcronisPricingCalculator from "@marketing/components/compare/react/AcronisPricingCalculator";
import BackblazePricingCalculator from "@marketing/components/compare/react/BackblazePricingCalculator";
import BlinkDiskPricingCalculator from "@marketing/components/compare/react/BlinkDiskPricingCalculator";
import CarbonitePricingCalculator from "@marketing/components/compare/react/CarbonitePricingCalculator";
import CrashPlanPricingCalculator from "@marketing/components/compare/react/CrashPlanPricingCalculator";
import EaseUSTodoBackupPricingCalculator from "@marketing/components/compare/react/EaseUSTodoBackupPricingCalculator";
import FreePricingCalculator from "@marketing/components/compare/react/FreePricingCalculator";
import FreemiumPricingCalculator from "@marketing/components/compare/react/FreemiumPricingCalculator";
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

const pricingCalculators: Record<
  BackupTool["pricing"],
  React.ComponentType | null
> = {
  free: FreePricingCalculator,
  freemium: FreemiumPricingCalculator,
  custom: null,
};

function resolveCalculator(tool: BackupTool): React.ComponentType | null {
  if (tool.slug in calculators) return calculators[tool.slug] ?? null;
  return pricingCalculators[tool.pricing] ?? null;
}

export default function PricingCalculator({ tool }: Props) {
  const Calculator = resolveCalculator(tool);

  if (!Calculator) {
    return null;
  }

  return <Calculator />;
}
