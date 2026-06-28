import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

function parseLocalStorageValue<T>(item: string | null, initialValue: T): T {
  if (item === null) return initialValue;

  try {
    return JSON.parse(item) as T;
  } catch {
    return item as T;
  }
}

function readLocalStorageValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") return initialValue;

  try {
    return parseLocalStorageValue(
      window.localStorage.getItem(key),
      initialValue,
    );
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    readLocalStorageValue(key, initialValue),
  );

  const setStoredValue = useCallback<Dispatch<SetStateAction<T>>>(
    (nextValue) => {
      setValue((currentValue) => {
        const resolvedValue =
          typeof nextValue === "function"
            ? (nextValue as (value: T) => T)(currentValue)
            : nextValue;

        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(resolvedValue));
          }
        } catch {
          return resolvedValue;
        }

        return resolvedValue;
      });
    },
    [key],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== key && event.key !== null) return;

      setValue(parseLocalStorageValue(event.newValue, initialValue));
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [initialValue, key]);

  return [value, setStoredValue];
}
