import type { StorageProviderType } from "@blinkdisk/constants/providers";
import type { ProviderConfig } from "@blinkdisk/schemas/providers";
import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

export type CreateVaultStep = "VARIANT" | "PROVIDER" | "CONFIG" | "DETAILS";

type CreateVaultDialogOptions = {
  step: CreateVaultStep;
  provider?: StorageProviderType;
  config?: ProviderConfig;
  autoSelectedProvider?: boolean;
};

const defaultOptions: CreateVaultDialogOptions = {
  step: "VARIANT",
};

const store = new Store<{
  isOpen: boolean;
  options: CreateVaultDialogOptions;
}>({
  isOpen: false,
  options: defaultOptions,
});

export function useCreateVaultDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  const openCreateVault = useCallback(
    (options: Partial<CreateVaultDialogOptions> = {}) => {
      store.setState({
        isOpen: true,
        options: {
          ...defaultOptions,
          ...options,
        },
      });
    },
    [],
  );

  const setOptions = useCallback(
    (options: Partial<CreateVaultDialogOptions>) => {
      store.setState((state) => ({
        ...state,
        options: {
          ...state.options,
          ...options,
        },
      }));
    },
    [],
  );

  const resetOptions = useCallback(() => {
    store.setState((state) => ({
      ...state,
      options: defaultOptions,
    }));
  }, []);

  return {
    isOpen,
    options,
    setIsOpen,
    openCreateVault,
    setOptions,
    resetOptions,
  };
}
