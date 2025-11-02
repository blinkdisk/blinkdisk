/// <reference types="vite/client" />
import { useThemeListener } from "@hooks/use-theme-listener";
import { Chatbox } from "@landing/components/chatbox";
import globals from "@styles/globals.css?url";
import inter from "@styles/inter.css?url";
import mono from "@styles/mono.css?url";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { SkeletonTheme } from "@ui/skeleton";
import { Toaster } from "@ui/toast";
import { PostHogProvider } from "posthog-js/react";
import type { ReactNode } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import { Footer } from "../components/footer";
import { Navigation } from "../components/navigation";

const defaultTitle = "BlinkDisk | Backup and secure your files";

const defaultDescription =
  "BlinkDisk is a desktop application that lets you effortlessly backup all your important files with just a few clicks.";

const defaultImage = `${process.env.LANDING_URL}/brand/social.jpg`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: defaultTitle,
      },
      {
        property: "description",
        content: defaultDescription,
      },
      {
        property: "og:title",
        content: defaultTitle,
      },
      {
        property: "og:description",
        content: defaultDescription,
      },
      {
        property: "og:image",
        content: defaultImage,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "BlinkDisk",
      },
      {
        name: "apple-mobile-web-app-title",
        content: "BlinkDisk",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:site",
        content: "@blinkdisk",
      },
      {
        name: "twitter:title",
        content: defaultTitle,
      },
      {
        name: "twitter:description",
        content: defaultDescription,
      },
      {
        name: "twitter:image",
        content: defaultImage,
      },
    ],
    links: [
      { rel: "stylesheet", href: globals },
      { rel: "stylesheet", href: inter },
      { rel: "stylesheet", href: mono },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon/favicon-96x96.png",
        sizes: "96x96",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon/favicon.svg",
      },
      {
        rel: "shortcut icon",
        href: "/favicon/favicon.ico",
      },
      {
        rel: "apple-touch-icon",
        href: "/favicon/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  useThemeListener();

  const location = useLocation();

  return (
    <RootDocument>
      <PostHogProvider
        apiKey={process.env.POSTHOG_LANDING_KEY || ""}
        options={{
          api_host: "https://eu.i.posthog.com",
          defaults: "2025-05-24",
        }}
      >
        <SkeletonTheme>
          {location.pathname.startsWith("/checkout") ? (
            <Outlet />
          ) : (
            <>
              <Toaster />
              <Navigation />
              <Outlet />
              <Footer />
            </>
          )}
        </SkeletonTheme>
      </PostHogProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="landing">
        {children}
        <Scripts />
        <Chatbox />
      </body>
    </html>
  );
}
