import { providers } from "@config/providers";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useMemo, useState } from "react";

export function useProviderSearch() {
  const { t } = useAppTranslation("vault");
  const [search, setSearch] = useState("");

  const providersWithName = useMemo(() => {
    return providers
      .filter((provider) => !provider.hidden)
      .map((provider) => ({
        ...provider,
        name: t(`providers.${provider.type}.name`),
      }));
  }, [t]);

  const filteredProviders = useMemo(() => {
    return providersWithName.filter((provider) =>
      provider.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [providersWithName, search]);

  return {
    search,
    setSearch,
    filteredProviders,
  };
}
