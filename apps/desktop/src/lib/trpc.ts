import type { AppRouter } from "@blinkdisk/api/router";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "blinkdiskapp://api/trpc",
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
