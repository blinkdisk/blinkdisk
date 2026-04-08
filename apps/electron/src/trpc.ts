import type { AppRouter } from "@blinkdisk/api/router";
import { PROTOCOL_API_URL } from "@blinkdisk/constants/app";
import { createTRPCProxyClient, httpLink } from "@trpc/client";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: `${PROTOCOL_API_URL}/trpc`,
      // fetch(url, options) {
      //   return fetch(url, {
      //     ...options,
      //     credentials: "include",
      //   });
      // },
      // headers:(opts) => {opts.op.context}
    }),
  ],
});
