import "./styles.css";

import {
  reactErrorHandler,
  init as reactInit,
  tanstackRouterBrowserTracingIntegration,
} from "@sentry/react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { DefaultErrorPage } from "@blinkdisk/components/errors/default";
import { NotFoundPage } from "@blinkdisk/components/errors/not-found";
import { routeTree } from "@web/routeTree.gen";

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
