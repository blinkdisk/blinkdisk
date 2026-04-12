import type { AppRouter } from "@blinkdisk/api/router";
import { PROTOCOL_API_URL } from "@blinkdisk/constants/app";
import { ACCOUNT_ID_HEADER } from "@blinkdisk/constants/header";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${PROTOCOL_API_URL}/trpc`,
      headers: () => {
        const split = window.location.hash?.split("/");
        const accountId = split?.[1];

        if (!accountId) return {};

        return {
          [ACCOUNT_ID_HEADER]: accountId,
        };
      },
    }),
  ],
});
