import { Devtools } from "@desktop/components/devtools";
import { OfflineDialog } from "@desktop/components/offline-dialog";
import { useDeeplinkOpen } from "@desktop/hooks/use-deeplink-open";
import { useShortcutListener } from "@desktop/hooks/use-shortcut-listener";
import "@desktop/i18n";
import { useThemeListener } from "@hooks/use-theme-listener";
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
  useDeeplinkOpen();

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
        <PostHogErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <SkeletonTheme>
              <Outlet />
              <Devtools />
              <Toaster />
              <OfflineDialog />
            </SkeletonTheme>
          </QueryClientProvider>
        </PostHogErrorBoundary>
      </PostHogProvider>
    </SidebarProvider>
  );
}
