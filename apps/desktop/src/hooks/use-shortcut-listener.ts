import { useCallback, useEffect } from "react";

export function useShortcutListener() {
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") {
      e.preventDefault();
      window.electron.window.console();
    }

    if (e.ctrlKey && e.key === "r") {
      e.preventDefault();
      window.electron.window.reload();
    }

    // Hidden shortcut to test Sentry error reporting
    if (e.ctrlKey && e.shiftKey && e.key === "F12") {
      e.preventDefault();
      window.electron.sentry.testMain();
      throw new Error("Sentry test error form renderer process");
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);
}
