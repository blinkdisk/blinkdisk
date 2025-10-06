import { VaultPreview } from "@desktop/components/vaults/preview";
import {
  UnlinkedVaultItem,
  useUnlinkedVaults,
} from "@desktop/hooks/queries/use-unlinked-vaults";
import { Button } from "@ui/button";
import { ChevronRightIcon } from "lucide-react";

export type LinkVaultListProps = {
  onSelectVault: (vault: UnlinkedVaultItem) => void;
};

export function LinkVaultList({ onSelectVault }: LinkVaultListProps) {
  const { data: unlinkedVaults, isLoading } = useUnlinkedVaults();

  return (
    <div className="flex flex-col gap-4">
      {(isLoading
        ? (new Array(3).fill(undefined) as undefined[])
        : unlinkedVaults
      )?.map((vault, index) => (
        <Button
          variant="outline"
          key={vault?.id || index}
          className="h-auto justify-between rounded-lg py-3"
          innerClassName="justify-between w-full"
          onClick={() => vault && onSelectVault(vault)}
        >
          <VaultPreview vault={vault} />
          <ChevronRightIcon className="text-muted-foreground" />
        </Button>
      ))}
    </div>
  );
}
