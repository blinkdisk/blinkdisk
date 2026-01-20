import { Devtools } from "@desktop/components/devtools";
import { DefaultErrorPage } from "@desktop/components/errors/default";
import { OfflineDialog } from "@desktop/components/offline-dialog";
import { Update } from "@desktop/components/update";
import { useStorageListener } from "@desktop/hooks/use-app-storage";
import { useDeeplinkListener } from "@desktop/hooks/use-deeplink-listener";
import { useShortcutListener } from "@desktop/hooks/use-shortcut-listener";
import { useTheme, useThemeListener } from "@desktop/hooks/use-theme";
import "@desktop/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { SidebarProvider } from "@ui/sidebar";
import { SkeletonTheme } from "@ui/skeleton";
import { Toaster } from "@ui/toast";
import { CaptureResult } from "posthog-js";
import { PostHogErrorBoundary, PostHogProvider } from "posthog-js/react";
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
        <PostHogErrorBoundary fallback={DefaultErrorPage}>
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
        </PostHogErrorBoundary>
      </PostHogProvider>
    </SidebarProvider>
  );
}
