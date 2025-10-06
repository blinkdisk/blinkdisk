import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useCallback, useEffect, useState } from "react";

export function Devtools() {
  const [open, setOpen] = useState(false);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "<" && e.ctrlKey) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    },
    [setOpen],
  );

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  if (!import.meta.env.DEV) return null;
  if (!open) return null;
  return <TanStackRouterDevtools initialIsOpen />;
}
