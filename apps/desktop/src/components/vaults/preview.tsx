import { providers, ProviderType } from "@config/providers";
import { providerIcons } from "@desktop/components/icons/providers";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@utils/class";
import { MonitorIcon, UserIcon } from "lucide-react";
import { useMemo } from "react";

type VaultPreviewProps = {
  className?: string;
  vault:
    | {
        id: string;
        name: string;
        provider: ProviderType;
        deviceAlias: string;
        profileAlias: string;
      }
    | undefined;
};

export function VaultPreview({ vault, className }: VaultPreviewProps) {
  const provider = useMemo(() => {
    return providers.find((p) => p.type === vault?.provider);
  }, [vault]);

  const Icon = useMemo(() => {
    return provider && providerIcons[provider?.type];
  }, [provider]);

  return (
    <div className={cn("flex w-full items-center gap-4", className)}>
      {vault && Icon ? (
        <Icon className="!size-6 shrink-0" />
      ) : (
        <Skeleton className="shrink-0" width="1.5rem" height="1.5rem" />
      )}
      <div className="flex min-w-0 max-w-full flex-col items-start">
        <p className="text-foreground max-w-full truncate text-sm">
          {vault ? vault?.name : <Skeleton className="w-full" width="6rem" />}
        </p>
        <div className="text-muted-foreground flex max-w-full items-center gap-3 truncate text-sm">
          {vault ? (
            <>
              <div className="flex items-center gap-1.5">
                <MonitorIcon className="size-4" />
                <p>{vault.deviceAlias}</p>
              </div>
              <div className="flex items-center gap-1">
                <UserIcon className="size-4" />
                <p>{vault.profileAlias}</p>
              </div>
            </>
          ) : (
            <Skeleton className="w-full" width="8rem" />
          )}
        </div>
      </div>
    </div>
  );
}
