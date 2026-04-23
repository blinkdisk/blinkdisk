import type { BackupTool } from "@blinkdisk/constants/tools";
import AcronisPricingCalculator from "@marketing/components/compare/react/AcronisPricingCalculator";
import AOMEIBackupperPricingCalculator from "@marketing/components/compare/react/AOMEIBackupperPricingCalculator";
import BackblazePricingCalculator from "@marketing/components/compare/react/BackblazePricingCalculator";
import BlinkDiskPricingCalculator from "@marketing/components/compare/react/BlinkDiskPricingCalculator";
import CarbonitePricingCalculator from "@marketing/components/compare/react/CarbonitePricingCalculator";
import CrashPlanPricingCalculator from "@marketing/components/compare/react/CrashPlanPricingCalculator";
import DuplicacyPricingCalculator from "@marketing/components/compare/react/DuplicacyPricingCalculator";
import DuplicatiPricingCalculator from "@marketing/components/compare/react/DuplicatiPricingCalculator";
import EaseUSTodoBackupPricingCalculator from "@marketing/components/compare/react/EaseUSTodoBackupPricingCalculator";
import FreemiumPricingCalculator from "@marketing/components/compare/react/FreemiumPricingCalculator";
import FreePricingCalculator from "@marketing/components/compare/react/FreePricingCalculator";
import IDrivePricingCalculator from "@marketing/components/compare/react/IDrivePricingCalculator";
import MacriumReflectHomePricingCalculator from "@marketing/components/compare/react/MacriumReflectHomePricingCalculator";
import UraniumBackupPricingCalculator from "@marketing/components/compare/react/UraniumBackupPricingCalculator";

type Props = {
  tool: BackupTool;
};

const calculators: Record<string, React.ComponentType> = {
  blinkdisk: BlinkDiskPricingCalculator,
  backblaze: BackblazePricingCalculator,
  carbonite: CarbonitePricingCalculator,
  crashplan: CrashPlanPricingCalculator,
  duplicacy: DuplicacyPricingCalculator,
  "acronis-true-image": AcronisPricingCalculator,
  "aomei-backupper": AOMEIBackupperPricingCalculator,
  "easeus-todo-backup": EaseUSTodoBackupPricingCalculator,
  idrive: IDrivePricingCalculator,
  "macrium-reflect-home": MacriumReflectHomePricingCalculator,
  "uranium-backup": UraniumBackupPricingCalculator,
  duplicati: DuplicatiPricingCalculator,
};

const pricingCalculators: Record<
  BackupTool["pricing"],
  React.ComponentType | null
> = {
  free: FreePricingCalculator,
  freemium: FreemiumPricingCalculator,
  paid: null,
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
