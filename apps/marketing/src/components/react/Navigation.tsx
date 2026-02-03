import { useIsMobile } from "@hooks/use-mobile";
import { cn } from "@utils/class";
import { DownloadIcon, MenuIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import logoDark from "@/assets/brand/logo-dark.svg";
import logoLight from "@/assets/brand/logo-light.svg";

const links = [
  { href: "/pricing", label: "Pricing" },
  {
    label: "GitHub",
    href: "https://github.com/blinkdisk/blinkdisk",
    target: "_blank",
  },
  {
    label: "Roadmap",
    href: "https://github.com/orgs/blinkdisk/projects/2",
    target: "_blank",
  },
];

export default function Navigation() {
  const mobile = useIsMobile();

  const [docked, setDocked] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setDocked(window.scrollY >= 100);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        style={{ zIndex: 1002 }}
        className={cn(
          "w-content fixed left-1/2 flex -translate-x-1/2 items-center justify-between rounded-2xl border py-4 transition-all duration-300",
          mobile ? "flex-col" : "flex-row",
          docked || open
            ? "bg-secondary border-foreground/10 top-4 p-4"
            : "top-0 border-transparent",
        )}
      >
        {mobile ? (
          <>
            <div className="flex w-full items-center justify-between">
              <Logo />
              <button
                className="flex size-8 items-center justify-center"
                onClick={() => setOpen(!open)}
              >
                <span className="sr-only">
                  {open ? "Close navigation" : "Open navigation"}
                </span>
                {open ? (
                  <XIcon className="text-foreground/60 hover:text-foreground/80 size-6" />
                ) : (
                  <MenuIcon className="text-foreground/60 hover:text-foreground/80 size-6" />
                )}
              </button>
            </div>
            <div
              className={cn(
                "grid w-full overflow-hidden transition-all duration-200",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="flex w-full flex-col items-start overflow-hidden">
                <div className="mb-6 mt-4 flex flex-col gap-2 p-2">
                  <Links />
                </div>
                <Buttons className="w-full p-2" />
              </div>
            </div>
          </>
        ) : (
          <>
            <Logo />
            <div className="flex items-center gap-12">
              <Links />
            </div>
            <Buttons />
          </>
        )}
      </div>
      {mobile && (
        <div
          style={{ zIndex: 1000 }}
          onClick={() => setOpen(false)}
          className={cn(
            "fixed inset-0 bg-black/20 pt-16 transition-opacity duration-200 dark:bg-black/50",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
      )}
    </>
  );
}

function Logo() {
  return (
    <a href="/" className="ml-1.5">
      <img
        src={logoLight.src}
        className="h-5 select-none dark:hidden sm:!h-6"
        draggable={false}
        alt="BlinkDisk"
      />
      <img
        src={logoDark.src}
        className="hidden h-5 select-none dark:block sm:!h-6"
        draggable={false}
        alt="BlinkDisk"
      />
    </a>
  );
}

function Buttons({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-2", className)}>
      <a
        href="https://github.com/blinkdisk/blinkdisk"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-secondary hover:bg-secondary/80 border-border flex size-10 items-center justify-center rounded-md border transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </a>
      <a
        href="/download"
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 grow items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors"
      >
        <DownloadIcon className="size-4" /> Download
      </a>
    </div>
  );
}

function Links() {
  return links.map((link) => (
    <a
      key={link.href}
      href={link.href}
      className="text-foreground/80 hover:text-foreground transition-colors"
      target={link.target}
      rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
    >
      {link.label}
    </a>
  ));
}
