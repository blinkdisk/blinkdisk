import { Devtools } from "@blinkdisk/components/devtools";
import { useThemeListener } from "@blinkdisk/hooks/use-theme-listener";
import { SkeletonTheme } from "@blinkdisk/ui/skeleton";
import { Toaster } from "@blinkdisk/ui/toast";
import { TooltipProvider } from "@blinkdisk/ui/tooltip";
import { I18nextProvider } from "@blinkdisk/utils/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";
import { useTheme } from "@web/hooks/use-theme";
import { i18n } from "@web/i18n";
import { PostHogProvider } from "posthog-js/react";

import "react-loading-skeleton/dist/skeleton.css";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    scripts: [
      {
        src: "https://assets.endorsely.com/endorsely.js",
        async: true,
        "data-endorsely": process.env.ENDORSELY_PUBLIC_KEY || "",
      },
    ],
  }),
});

function RootComponent() {
  const theme = useTheme();

  useThemeListener(theme);

  return (
    <>
      <HeadContent />
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <PostHogProvider
            apiKey={process.env.POSTHOG_KEY || ""}
            options={{
              api_host: process.env.POSTHOG_HOST || "https://eu.i.posthog.com",
              ui_host: "https://eu.posthog.com",
              defaults: "2025-05-24",
              capture_exceptions: true,
            }}
          >
            <QueryClientProvider client={queryClient}>
              <Devtools />
              <SkeletonTheme dark={theme.dark}>
                <Outlet />
                <Toaster dark={theme.dark} />
              </SkeletonTheme>
            </QueryClientProvider>
          </PostHogProvider>
        </TooltipProvider>
      </I18nextProvider>
    </>
  );
}
