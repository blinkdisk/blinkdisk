import { electronProxyClient } from "@better-auth/electron/proxy";
import { APP_ID_ORIGIN, APP_SCHEME } from "@blinkdisk/constants/app";
import {
  ELECTRON_CLIENT_ID,
  ELECTRON_COOKIE_PREFIX,
} from "@blinkdisk/constants/auth";
import {
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.API_URL,
  basePath: "/api/auth",
  trustedOrigins: [APP_ID_ORIGIN],
  plugins: [
    electronProxyClient({
      protocol: {
        scheme: APP_SCHEME,
      },
      cookiePrefix: ELECTRON_COOKIE_PREFIX,
      clientID: ELECTRON_CLIENT_ID,
    }) as Omit<ReturnType<typeof electronProxyClient>, "$InferServerPlugin">,
    magicLinkClient(),
    multiSessionClient(),
    inferAdditionalFields({
      user: {
        language: {
          type: "string",
          required: false,
        },
        timeZone: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});
