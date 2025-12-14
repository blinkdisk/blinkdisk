import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useCallback, useEffect, useMemo } from "react";
import { useMediaQuery } from "usehooks-ts";

export type Theme = "system" | "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useAppStorage("preferences.theme", "system");
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

export function useThemeListener() {
  const { dark, theme, setTheme } = useTheme();

  useEffect(() => {
    document.body.classList.add("disable-transitions");

    setTimeout(() => {
      if (dark) document.body.classList.add("dark");
      else document.body.classList.remove("dark");

      setTimeout(() => {
        document.body.classList.remove("disable-transitions");
      }, 25);
    }, 25);
  }, [dark]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "y" && e.ctrlKey) {
        e.preventDefault();
        setTheme(theme === "dark" ? "light" : "dark");
      }
    },
    [theme, setTheme],
  );

  useEffect(() => {
    if (
      "env" in import.meta &&
      !(import.meta as unknown as { env: { DEV: boolean } }).env.DEV
    )
      return;

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);
}
