import { ProviderType, providers } from "@config/providers";
import { providerIcons } from "@desktop/components/icons/providers";
import { useProviderSearch } from "@desktop/hooks/use-provider-search";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { ChevronRightIcon, SearchIcon } from "lucide-react";

export type CreateVaultProvidersProps = {
  selectProvider: (provider: ProviderType) => void;
};

export function CreateVaultProviders({
  selectProvider,
}: CreateVaultProvidersProps) {
  const { t } = useAppTranslation("vault");
  const { search, setSearch, filteredProviders } = useProviderSearch();

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="relative">
        <Input
          className="w-full pl-10"
          placeholder={t("createDialog.providers.search.placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2" />
      </div>
      <div className="h-70 flex flex-col gap-3 overflow-y-auto">
        {filteredProviders.map((provider) => (
          <Provider
            key={provider.type}
            provider={provider}
            selectProvider={selectProvider}
          />
        ))}
      </div>
    </div>
  );
}

type ProviderProps = {
  provider: (typeof providers)[number] & { name: string };
  selectProvider: (provider: ProviderType) => void;
};

function Provider({ provider, selectProvider }: ProviderProps) {
  const { t } = useAppTranslation("vault");

  const Icon = providerIcons[provider.type];

  return (
    <Button
      variant="outline"
      key={provider.type}
      className="h-auto shrink-0 py-4"
      innerClassName="justify-between w-full"
      onClick={() => selectProvider(provider.type)}
    >
      <div className="flex items-center gap-4">
        <Icon className="!size-6" />
        <div className="flex flex-col items-start">
          <p>{provider.name}</p>
          <p className="text-muted-foreground text-xs">
            {t(`providers.${provider.type}.description`)}
          </p>
        </div>
      </div>
      <ChevronRightIcon className="text-muted-foreground" />
    </Button>
  );
}
