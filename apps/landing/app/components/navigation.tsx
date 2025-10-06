import { useIsMobile } from "@hooks/use-mobile";
import { useTheme } from "@hooks/use-theme";
import { GithubIcon } from "@landing/components/icons/github";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { DownloadIcon } from "lucide-react";
import logoDark from "../assets/brand/logo-dark.svg";
import logoLight from "../assets/brand/logo-light.svg";

export function Navigation() {
  const navigate = useNavigate();
  const mobile = useIsMobile();

  const { dark } = useTheme();

  if (typeof window === "undefined") return null;
  return (
    <div className="bg-background flex w-screen items-center justify-between p-4 sm:absolute sm:left-1/2 sm:top-14 sm:z-[50] sm:w-[32rem] sm:-translate-x-1/2 sm:rounded-2xl sm:border">
      <div className="flex items-center gap-4">
        <Link to="/">
          <img
            src={dark ? logoDark : logoLight}
            className="h-5.5 ml-1.5 select-none sm:h-6"
            draggable={false}
          />
        </Link>
      </div>
      <div className="flex gap-2">
        <Button
          as="a"
          target="_blank"
          href="https://github.com/blinkdisk/blinkdisk"
          size={mobile ? "icon-sm" : "icon"}
          variant="outline"
        >
          <GithubIcon />
        </Button>
        <Button as="link" to="/download" size={mobile ? "sm" : "default"}>
          <DownloadIcon /> Download
        </Button>
      </div>
    </div>
  );
}
