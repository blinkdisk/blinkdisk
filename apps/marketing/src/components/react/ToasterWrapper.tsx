import { Toaster } from "@blinkdisk/ui/toast";
import { useEffect, useState } from "react";

function getIsDark() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  );
}

export default function ToasterWrapper() {
  const [dark, setDark] = useState(getIsDark);

  useEffect(() => {
    const updateTheme = () => {
      setDark(document.documentElement.classList.contains("dark"));
    };

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return <Toaster dark={dark} />;
}
