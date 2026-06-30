import { useCallback, useEffect } from "react";

export type Theme = "light" | "dark" | "system";

export function useThemeListener({
  dark,
  theme,
  setTheme,
}: {
  dark: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) {
  useEffect(() => {
    document.body.classList.add("disable-transitions");

    let transitionTimeout: ReturnType<typeof setTimeout> | undefined;
    const themeTimeout = setTimeout(() => {
      if (dark) document.body.classList.add("dark");
      else document.body.classList.remove("dark");

      transitionTimeout = setTimeout(() => {
        document.body.classList.remove("disable-transitions");
      }, 25);
    }, 25);

    return () => {
      clearTimeout(themeTimeout);
      if (transitionTimeout) clearTimeout(transitionTimeout);
      document.body.classList.remove("disable-transitions");
    };
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
