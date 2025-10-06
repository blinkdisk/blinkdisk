import "@styles/font.css";
import "@styles/globals.css";

import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { DefaultErrorPage } from "@desktop/components/errors/default";
import { NotFoundPage } from "@desktop/components/errors/not-found";
import { routeTree } from "./routeTree.gen";

export const history = createHashHistory();

const router = createRouter({
  history,
  routeTree,
  defaultErrorComponent: DefaultErrorPage,
  defaultNotFoundComponent: NotFoundPage,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
