import "./styles.css";

import { init } from "@sentry/electron/renderer";
import {
  reactErrorHandler,
  init as reactInit,
  tanstackRouterBrowserTracingIntegration,
} from "@sentry/react";
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { DefaultErrorPage } from "#components/errors/default";
import { NotFoundPage } from "#components/errors/not-found";
import { routeTree } from "./routeTree.gen";

export const history = createHashHistory();

const router = createRouter({
  history,
  routeTree,
  defaultErrorComponent: DefaultErrorPage,
  defaultNotFoundComponent: NotFoundPage,
});

init(
  {
    dsn: process.env.SENTRY_DESKTOP_DSN,
    integrations: [tanstackRouterBrowserTracingIntegration(router)],
  },
  reactInit,
);

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
