import { electronProxyClient } from "@better-auth/electron/proxy";
import {
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.API_URL,
  basePath: "/api/auth",
  trustedOrigins: ["com.blinkdisk.app:/"],
  plugins: [
    electronProxyClient({
      protocol: {
        scheme: "com.blinkdisk.app",
      },
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
