import { useEffect, useState } from "react";

function getIsMobile() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches
  );
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 768px)");

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
