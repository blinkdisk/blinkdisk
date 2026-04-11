import type { AppRouter } from "@blinkdisk/api/router";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { authClient, getAccountCookie } from "./auth";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: `${process.env.API_URL}/trpc`,
      headers: async (opts) =>
        opts.op.context.accountId
          ? {
              Cookie:
                (await getAccountCookie(opts.op.context.accountId as string)) ||
                "",
            }
          : {
              Cookie: authClient.getCookie(),
            },
    }),
  ],
});
