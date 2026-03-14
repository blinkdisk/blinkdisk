import { Devtools } from "#components/devtools";
import { OfflineDialog } from "#components/offline-dialog";
import { Update } from "#components/update";
import { useStorageListener } from "#hooks/use-app-storage";
import { useDeeplinkListener } from "#hooks/use-deeplink-listener";
import { useShortcutListener } from "#hooks/use-shortcut-listener";
import { useTheme, useThemeListener } from "#hooks/use-theme";
import { SidebarProvider } from "@blinkdisk/ui/sidebar";
import { SkeletonTheme } from "@blinkdisk/ui/skeleton";
import { Toaster } from "@blinkdisk/ui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { CaptureResult } from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

import "#i18n";
import "react-loading-skeleton/dist/skeleton.css";

export const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useThemeListener();
  useShortcutListener();
  useDeeplinkListener();
  useStorageListener();

  const { dark } = useTheme();

  return (
    <SidebarProvider>
      <PostHogProvider
        apiKey={process.env.POSTHOG_DESKTOP_KEY || ""}
        options={{
          api_host: "https://eu.i.posthog.com",
          defaults: "2025-05-24",
          capture_exceptions: true,
          before_send: (event: CaptureResult | null): CaptureResult | null => {
            if (event?.properties?.$current_url) {
              const parsed = new URL(event.properties.$current_url);
              if (parsed.hash)
                event.properties.$pathname = parsed.pathname + parsed.hash;
            }

            return event;
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <Devtools />
          <SkeletonTheme dark={dark}>
            <Update>
              <Outlet />
              <Toaster dark={dark} />
              <OfflineDialog />
            </Update>
          </SkeletonTheme>
        </QueryClientProvider>
      </PostHogProvider>
    </SidebarProvider>
  );
}
