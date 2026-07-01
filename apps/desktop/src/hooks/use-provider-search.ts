import { STORAGE_PROVIDERS } from "@blinkdisk/constants/providers";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { useState } from "react";

export function useProviderSearch() {
  const { t } = useAppTranslation("vault");
  const [search, setSearch] = useState("");

  const providersWithName = STORAGE_PROVIDERS.flatMap((provider) =>
    provider.hidden
      ? []
      : [
          {
            ...provider,
            name: t(`providers.${provider.type}.name`),
          },
        ],
  );

  const filteredProviders = providersWithName.filter((provider) =>
    provider.name.toLowerCase().includes(search.toLowerCase()),
  );

  return {
    search,
    setSearch,
    filteredProviders,
  };
}
