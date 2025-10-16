import { useTheme } from "@hooks/use-theme";
import { Link } from "@tanstack/react-router";
import logoDark from "../assets/brand/logo-dark.svg";
import logoLight from "../assets/brand/logo-light.svg";

export function Footer() {
  const { dark } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 sm:p-12">
      <Link to="/">
        <img
          src={dark ? logoDark : logoLight}
          className="h-8 select-none"
          draggable={false}
        />
      </Link>
      <p className="text-muted-foreground text-center text-sm">
        © {new Date().getUTCFullYear()} BlinkDisk, All Rights Reserved.
      </p>
      <div className="text-muted-foreground flex items-center gap-4 text-xs">
        <Link to="/terms">Terms of Service</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/imprint">Imprint</Link>
      </div>
    </div>
  );
}
