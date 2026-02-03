import { useEffect, useState } from "react";
import { Toaster } from "@ui/toast";

export default function ToasterWrapper() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return <Toaster dark={dark} />;
}
