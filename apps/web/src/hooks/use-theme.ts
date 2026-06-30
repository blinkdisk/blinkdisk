import { useLocalStorage } from "@blinkdisk/hooks/use-local-storage";
import { useMediaQuery } from "@blinkdisk/hooks/use-media-query";
import type { Theme } from "@blinkdisk/hooks/use-theme-listener";

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>(
    "preferences.theme",
    "system",
  );
  const media = useMediaQuery("(prefers-color-scheme: dark)");

  const shownTheme = (() => {
    if (theme !== "system") return theme;
    return media ? "dark" : "light";
  })();

  return {
    dark: shownTheme === "dark",
    light: shownTheme === "light",
    shownTheme,
    theme,
    setTheme,
  };
}
