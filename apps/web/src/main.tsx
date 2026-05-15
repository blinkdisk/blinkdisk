import "./styles.css";

import { DefaultErrorPage } from "@blinkdisk/components/errors/default";
import { NotFoundPage } from "@blinkdisk/components/errors/not-found";
import {
  reactErrorHandler,
  init as reactInit,
  tanstackRouterBrowserTracingIntegration,
} from "@sentry/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@web/routeTree.gen";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

const router = createRouter({
  routeTree,
  defaultErrorComponent: DefaultErrorPage,
  defaultNotFoundComponent: NotFoundPage,
});

reactInit({
  dsn: process.env.SENTRY_WEB_DSN,
  integrations: [tanstackRouterBrowserTracingIntegration(router)],
  enabled: process.env.NODE_ENV !== "development",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement, {
    onUncaughtError: reactErrorHandler(console.error),
    onCaughtError: reactErrorHandler(console.error),
    onRecoverableError: reactErrorHandler(console.error),
  });

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
