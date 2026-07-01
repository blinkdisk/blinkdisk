import type { StorageProviderType } from "@blinkdisk/constants/providers";
import type { ProviderConfig } from "@blinkdisk/schemas/providers";
import { Store, useStore } from "@tanstack/react-store";

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

function setIsOpen(to: boolean) {
  store.setState((state) => ({
    ...state,
    isOpen: to,
  }));
}

function openCreateVault(options: Partial<CreateVaultDialogOptions> = {}) {
  store.setState(() => ({
    isOpen: true,
    options: {
      ...defaultOptions,
      ...options,
    },
  }));
}

function setOptions(options: Partial<CreateVaultDialogOptions>) {
  store.setState((state) => ({
    ...state,
    options: {
      ...state.options,
      ...options,
    },
  }));
}

function resetOptions() {
  store.setState((state) => ({
    ...state,
    options: defaultOptions,
  }));
}

export function useCreateVaultDialog() {
  const { isOpen, options } = useStore(store);

  return {
    isOpen,
    options,
    setIsOpen,
    openCreateVault,
    setOptions,
    resetOptions,
  };
}
