import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from "react";

function readLocalStorageValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") return initialValue;

  let item: string | null;
  try {
    item = window.localStorage.getItem(key);
    if (item === null) return initialValue;
  } catch {
    return initialValue;
  }

  try {
    return JSON.parse(item) as T;
  } catch {
    return item as T;
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
          window.localStorage.setItem(key, JSON.stringify(resolvedValue));
        } catch {
          return resolvedValue;
        }

        return resolvedValue;
      });
    },
    [key],
  );

  return [value, setStoredValue];
}
