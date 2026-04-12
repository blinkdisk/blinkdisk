import type { AppRouter } from "@blinkdisk/api/router";
import { authClient, getAccountCookie } from "@electron/auth";
import { createTRPCProxyClient, httpLink } from "@trpc/client";

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
