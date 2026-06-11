import { resolveStorageProviderType } from "@blinkdisk/constants/providers";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZVaultType } from "@blinkdisk/schemas/vault";
import { providerIcons } from "@desktop/components/icons/providers/index";

type VaultPreviewProps = {
  vault: ZVaultType;
};

export function VaultPreview({ vault }: VaultPreviewProps) {
  const { t } = useAppTranslation("vault");

  const displayProviderType = resolveStorageProviderType(vault.provider);
  const Icon = providerIcons[displayProviderType];

  return (
    <div className="flex items-center gap-2.5">
      <div className="bg-muted border flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-4" />
      </div>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate text-[0.875rem] font-semibold">
          {vault.name}
        </span>
        <span className="text-muted-foreground truncate text-xs">
          {t(`providers.${displayProviderType}.name`)}
        </span>
      </div>
    </div>
  );
}
