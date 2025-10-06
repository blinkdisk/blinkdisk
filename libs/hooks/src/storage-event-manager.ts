const STORAGE_CHANGE_EVENT = "app-storage-change";

const isElectron = typeof window !== "undefined" && "electron" in window;

export class StorageEventManager {
  private static subscribers = new Set<() => void>();
  private static isInitialized = false;

  private constructor() {}

  static subscribe(callback: () => void): () => void {
    StorageEventManager.initialize();

    StorageEventManager.subscribers.add(callback);

    return () => {
      StorageEventManager.subscribers.delete(callback);
    };
  }

  private static initialize() {
    if (StorageEventManager.isInitialized || typeof window === "undefined")
      return;

    StorageEventManager.isInitialized = true;

    if (isElectron) {
      const callback = () => {
        StorageEventManager.subscribers.forEach((callback) => {
          callback();
        });
      };

      window.electron!.store.change.on(callback);
    } else {
      const handleStorageChange = () => {
        StorageEventManager.subscribers.forEach((callback) => callback());
      };

      window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    }
  }
}

export { STORAGE_CHANGE_EVENT };
