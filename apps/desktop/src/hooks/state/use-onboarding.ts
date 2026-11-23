import type { StorageProviderType } from "@blinkdisk/constants/providers";
import type { ProviderConfig } from "@blinkdisk/schemas/providers";
import type {
  FirstBackupStatus,
  FolderSelection,
  OnboardingStorage,
  OnboardingView,
} from "@desktop/lib/onboarding";
import { Store, useStore } from "@tanstack/react-store";

export type FirstBackupStage = "VAULT" | "FOLDERS" | "UPLOAD";

type OnboardingState = {
  view: OnboardingView;
  selection: FolderSelection;
  customPaths: string[];
  storage: OnboardingStorage;
  provider?: StorageProviderType;
  config?: ProviderConfig;
  awaitingAuth: boolean;
  firstBackup: {
    status: FirstBackupStatus;
    stage: FirstBackupStage;
  };
};

const initialState: OnboardingState = {
  view: "welcome",
  selection: {},
  customPaths: [],
  storage: "CLOUDBLINK",
  awaitingAuth: false,
  firstBackup: { status: "IDLE", stage: "VAULT" },
};

const store = new Store<OnboardingState>(initialState);

function update(changes: Partial<OnboardingState>) {
  store.setState((state) => ({ ...state, ...changes }));
}

export function resetOnboarding() {
  store.setState(() => initialState);
}

export function resumeOnboardingAfterAuth() {
  update({
    awaitingAuth: false,
    storage: "CLOUDBLINK",
    view: store.state.awaitingAuth ? "password" : "folders",
  });
}

export function setFirstBackup(firstBackup: OnboardingState["firstBackup"]) {
  update({ firstBackup });
}

const actions = {
  setView: (view: OnboardingView) => update({ view }),
  selectFolder: (path: string, selected: boolean) =>
    update({ selection: { ...store.state.selection, [path]: selected } }),
  addFolder: (path: string) =>
    update({
      customPaths: [...new Set([...store.state.customPaths, path])],
      selection: { ...store.state.selection, [path]: true },
    }),
  setStorage: (storage: OnboardingStorage) => update({ storage }),
  setAwaitingAuth: (awaitingAuth: boolean) => update({ awaitingAuth }),
  selectProvider: (provider: StorageProviderType) =>
    update({
      provider,
      config:
        store.state.provider === provider ? store.state.config : undefined,
      view: "config",
    }),
  submitConfig: (config: ProviderConfig) =>
    update({ config, view: "password" }),
};

export function useOnboarding() {
  const state = useStore(store);

  return { ...state, ...actions };
}
