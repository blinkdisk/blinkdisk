import { useTheme } from "@landing/hooks/use-theme";
import { Link } from "@tanstack/react-router";
import logoDark from "../assets/brand/logo-dark.svg";
import logoLight from "../assets/brand/logo-light.svg";
import { GithubIcon } from "./icons/github";
import { XIcon } from "./icons/x";
import { YoutubeIcon } from "./icons/youtube";

const footerLinks = {
  product: [
    { label: "Download", to: "/download" },
    { label: "Pricing", to: "/pricing" },
    { label: "Roadmap", to: "https://github.com/orgs/blinkdisk/projects/2", target: "_blank" },
  ],
  resources: [
    { label: "GitHub", href: "https://github.com/blinkdisk/blinkdisk" },
    { label: "Support", href: "mailto:support@blinkdisk.com" },
    { label: "Status", href: "https://status.blinkdisk.com" },
  ],
  legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Imprint", to: "/imprint" },
  ],
};

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/blinkdisk",
    icon: <GithubIcon className="size-5" />,
  },
  {
    label: "X (formerly Twitter)",
    href: "https://x.com/blinkdisk",
    icon: <XIcon className="size-5" />,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@blinkdisk",
    icon: <YoutubeIcon className="size-5" />,
  },
];

export function Footer() {
  const { dark } = useTheme();

  return (
    <footer className="bg-secondary border-t">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 flex flex-col items-center md:items-start">
            <Link to="/" className="inline-block">
              <img
                src={dark ? logoDark : logoLight}
                className="h-7 select-none"
                draggable={false}
                alt="BlinkDisk"
              />
            </Link>
            <p className="text-muted-foreground mt-4 text-sm">
              The easiest way to backup your files.
            </p>
            <div className="mt-6 flex justify-center gap-4 md:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-foreground text-sm font-semibold">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    target={link.target}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-foreground text-sm font-semibold">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-foreground text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            © {new Date().getUTCFullYear()} BlinkDisk. All rights reserved.
          </p>
          <iframe
            src={`https://status.blinkdisk.com/badge?theme=${dark ? "dark" : "light"}`}
            width="175"
            height="30"
            className="-mr-2"
            frameBorder="0"
            scrolling="no"
          />
        </div>
      </div>
    </footer>
  );
}
