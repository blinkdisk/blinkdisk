import type { Theme } from "@blinkdisk/hooks/use-theme-listener";
import { useMemo } from "react";
import { useLocalStorage, useMediaQuery } from "usehooks-ts";

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>(
    "preferences.theme",
    "system",
  );
  const media = useMediaQuery("(prefers-color-scheme: dark)");

  const shownTheme = useMemo(() => {
    if (theme !== "system") return theme;
    return media ? "dark" : "light";
  }, [theme, media]);

  return {
    dark: shownTheme === "dark",
    light: shownTheme === "light",
    shownTheme,
    theme,
    setTheme,
  };
}
