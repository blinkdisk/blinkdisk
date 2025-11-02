import { useIsMobile } from "@hooks/use-mobile";
import { useTheme } from "@hooks/use-theme";
import { GithubIcon } from "@landing/components/icons/github";
import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { cn } from "@utils/class";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { DownloadIcon, MenuIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import logoDark from "../assets/brand/logo-dark.svg";
import logoLight from "../assets/brand/logo-light.svg";

const links = [
  { href: "/pricing", label: "Pricing" },
  {
    label: "How it Works",
    href: "/#solution",
  },
  {
    label: "Features",
    href: "/#features",
  },
];

export function Navigation() {
  const router = useRouter();
  const mobile = useIsMobile();

  const { scrollY } = useScroll();
  const { dark } = useTheme();

  const [docked, setDocked] = useState(true);
  const [open, setOpen] = useState(false);

  const progress = useTransform(scrollY, [0, 100], [0, 1]);

  useEffect(() => {
    function onProgressChange(progress: number) {
      setDocked(progress >= 1);
    }

    onProgressChange(progress.get());
    progress.on("change", onProgressChange);

    return () => progress.destroy();
  }, [progress, dark]);

  useEffect(() => {
    return router.subscribe("onBeforeNavigate", () => {
      console.log("onBeforeNavigate");
      setOpen(false);
    });
  }, [router]);

  if (typeof window === "undefined") return null;
  return (
    <>
      <div
        style={{
          zIndex: 1002,
        }}
        className={cn(
          "w-content fixed left-1/2 flex -translate-x-1/2 items-center justify-between rounded-2xl border py-4 transition-all",
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
            <AnimatePresence>
              {open ? (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: "auto",
                    transition: { ease: "easeIn", duration: 0.15 },
                  }}
                  exit={{
                    height: 0,
                    transition: { ease: "easeOut", duration: 0.1 },
                  }}
                  className="flex w-full flex-col items-start overflow-hidden p-2"
                >
                  <div className="mb-6 mt-4 flex flex-col gap-2">
                    <Links />
                  </div>
                  <Buttons className="w-full" />
                </motion.div>
              ) : null}
            </AnimatePresence>
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
      {mobile ? (
        <AnimatePresence>
          {open ? (
            <motion.div
              style={{ zIndex: 1000 }}
              onClick={() => setOpen(false)}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
              }}
              transition={{ duration: 0.1 }}
              initial="visible"
              animate="visible"
              exit="hidden"
              className="fixed inset-0 bg-black/20 pt-16 dark:bg-black/50"
            ></motion.div>
          ) : null}
        </AnimatePresence>
      ) : null}
    </>
  );
}
export function Logo() {
  const { dark } = useTheme();

  return (
    <Link to="/">
      <img
        src={dark ? logoDark : logoLight}
        className="ml-1.5 h-5 select-none sm:!h-6"
        draggable={false}
      />
    </Link>
  );
}

export function Buttons({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-2", className)}>
      <Button
        as="a"
        target="_blank"
        href="https://github.com/blinkdisk/blinkdisk"
        size="icon"
        variant="outline"
      >
        <GithubIcon />
      </Button>
      <Button as="link" to="/download" className="grow">
        <DownloadIcon /> Download
      </Button>
    </div>
  );
}

export function Links() {
  return links.map((link) => (
    <Link
      key={link.href}
      to={link.href}
      className="text-foreground/80 hover:text-foreground transition-colors"
    >
      {link.label}
    </Link>
  ));
}
