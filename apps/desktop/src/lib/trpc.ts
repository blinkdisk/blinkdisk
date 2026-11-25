import type { AppRouter } from "@blinkdisk/api/router";
import { PROTOCOL_API_URL } from "@blinkdisk/constants/app";
import { ACCOUNT_ID_HEADER } from "@blinkdisk/constants/header";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

// The router has no reactive context here, so the account is read from the
// hash: "#/<accountId>/..." or "#/onboarding/<accountId>/...".
export function getAccountIdFromHash(hash: string) {
  const [path = ""] = hash.replace(/^#\/?/, "").split("?");
  const [first, second] = path.split("/");
  return (first === "onboarding" ? second : first) || undefined;
}

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${PROTOCOL_API_URL}/trpc`,
      headers: () => {
        const accountId = getAccountIdFromHash(window.location.hash);
        if (!accountId) return {};

        return {
          [ACCOUNT_ID_HEADER]: accountId,
        };
      },
    }),
  ],
});
