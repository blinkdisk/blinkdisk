import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZVaultType } from "@blinkdisk/schemas/vault";
import { VaultIcon } from "lucide-react";

type VaultPreviewProps = {
  vault: ZVaultType;
};

export function VaultPreview({ vault }: VaultPreviewProps) {
  const { t } = useAppTranslation("vault");

  return (
    <div className="flex items-center gap-2.5">
      <div className="bg-secondary flex size-9 shrink-0 items-center justify-center rounded-lg">
        <VaultIcon className="size-4" />
      </div>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate text-[0.875rem] font-semibold">
          {vault.name}
        </span>
        <span className="text-muted-foreground truncate text-xs">
          {t(`providers.${vault.provider}.name`)}
        </span>
      </div>
    </div>
  );
}
