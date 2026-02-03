import { useEffect, useMemo, useState } from "react";
import { useLocalStorage, useMediaQuery } from "usehooks-ts";

export type Theme = "system" | "dark" | "light";

export function useTheme() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useLocalStorage<Theme>(
    "preferences.theme",
    "system",
  );

  const media = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    setMounted(true);
  }, []);

  const shownTheme = useMemo(() => {
    if (theme !== "system") return theme;
    return media ? "dark" : "light";
  }, [theme, media]);

  // Before mount, check the DOM class to match the flash-free script
  const dark = mounted
    ? shownTheme === "dark"
    : typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");

  return {
    dark,
    light: !dark,
    shownTheme: mounted ? shownTheme : dark ? "dark" : "light",
    theme,
    setTheme,
    mounted,
  };
}
