import type { AppRouter } from "@blinkdisk/api/router";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

const API_URL = process.env.API_URL ?? "https://api.blinkdisk.com";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
