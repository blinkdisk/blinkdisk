import { useEffect } from "react";

export function useShortcutListener() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        window.electron.window.console();
      }

      if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        window.electron.window.reload();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}
