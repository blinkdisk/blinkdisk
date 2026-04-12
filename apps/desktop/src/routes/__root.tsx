import { Devtools } from "@blinkdisk/components/devtools";
import { useThemeListener } from "@blinkdisk/hooks/use-theme-listener";
import { SidebarProvider } from "@blinkdisk/ui/sidebar";
import { SkeletonTheme } from "@blinkdisk/ui/skeleton";
import { Toaster } from "@blinkdisk/ui/toast";
import { TooltipProvider } from "@blinkdisk/ui/tooltip";
import { I18nextProvider } from "@blinkdisk/utils/i18n";
import { AuthListener } from "@desktop/components/auth-listener";
import { AuthDialog } from "@desktop/components/dialogs/auth";
import { SelectAccountDialog } from "@desktop/components/dialogs/select-account";
import { Update } from "@desktop/components/update";
import { useStorageListener } from "@desktop/hooks/use-app-storage";
import { useDeeplinkListener } from "@desktop/hooks/use-deeplink-listener";
import { useShortcutListener } from "@desktop/hooks/use-shortcut-listener";
import { useTheme } from "@desktop/hooks/use-theme";
import { i18n } from "@desktop/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { CaptureResult } from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

import "react-loading-skeleton/dist/skeleton.css";

export const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const theme = useTheme();

  useThemeListener(theme);
  useShortcutListener();
  useDeeplinkListener();
  useStorageListener();

  return (
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <SidebarProvider>
          <PostHogProvider
            apiKey={process.env.POSTHOG_KEY || ""}
            options={{
              api_host: "https://eu.i.posthog.com",
              defaults: "2025-05-24",
              capture_exceptions: true,
              before_send: (
                event: CaptureResult | null,
              ): CaptureResult | null => {
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
              <SkeletonTheme dark={theme.dark}>
                <Update>
                  <Outlet />
                  <Toaster dark={theme.dark} />
                  <AuthDialog />
                  <SelectAccountDialog />
                  <AuthListener />
                </Update>
              </SkeletonTheme>
            </QueryClientProvider>
          </PostHogProvider>
        </SidebarProvider>
      </TooltipProvider>
    </I18nextProvider>
  );
}
