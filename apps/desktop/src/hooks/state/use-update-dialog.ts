import type { UpdateStatus } from "@blinkdisk/electron/updater";
import { Store, useStore } from "@tanstack/react-store";

type UpdateState = {
  isOpen: boolean;
  status: UpdateStatus | null;
};

const store = new Store<UpdateState>({
  isOpen: false,
  status: null,
});

const DISMISSED_UPDATE_VERSION_KEY = "dismissedUpdateVersion";

export type UpdateDialogTestState =
  | "hidden"
  | "downloading"
  | "downloaded"
  | "error";

function getUpdateVersion(status: UpdateStatus | null) {
  return status?.details?.version ?? null;
}

function shouldAutoOpen(status: UpdateStatus | null) {
  if (!status?.available) return false;

  const version = getUpdateVersion(status);
  if (!version) return true;

  return window.electron.store.get(DISMISSED_UPDATE_VERSION_KEY) !== version;
}

function setIsOpen(to: boolean) {
  store.setState((state) => ({
    ...state,
    isOpen: to,
  }));
}

function setStatus(to: UpdateStatus | null) {
  store.setState((state) => ({
    ...state,
    isOpen: shouldAutoOpen(to),
    status: to,
  }));
}

async function dismiss() {
  const version = getUpdateVersion(store.state.status);

  if (version) {
    await window.electron.store.set(DISMISSED_UPDATE_VERSION_KEY, version);
  }

  store.setState((state) => ({
    ...state,
    isOpen: false,
  }));
}

export function useUpdateDialog() {
  const { isOpen, status } = useStore(store);

  return {
    dismiss,
    isOpen,
    setIsOpen,
    status,
    setStatus,
  };
}
