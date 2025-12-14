import { useTheme } from "@desktop/hooks/use-theme";
import { cn } from "@utils/class";
import logoDark from "/brand/logo-dark.svg";
import logoLight from "/brand/logo-light.svg";

type LogoProps = {
  className?: string;
  theme?: "dark" | "light";
};

export function Logo({ theme, className }: LogoProps) {
  const { dark } = useTheme();

  return (
    <img
      src={
        theme == "dark"
          ? logoDark
          : theme === "light"
            ? logoLight
            : dark
              ? logoDark
              : logoLight
      }
      className={cn("h-5.5 select-none", className)}
      draggable={false}
    />
  );
}
