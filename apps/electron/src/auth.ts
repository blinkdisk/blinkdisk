import { electronClient } from "@better-auth/electron/client";
import {
  ZUpdatePreferencesType,
  ZUpdateUserType,
} from "@blinkdisk/schemas/settings";
import { store } from "@electron/store";
import {
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.API_URL,
  basePath: "/api/auth",
  plugins: [
    electronClient({
      signInURL: `${process.env.WEB_URL}/auth/register`,
      protocol: {
        scheme: "com.blinkdisk.app",
      },
      storage: {
        getItem: async (key: string) => {
          return store.get(key);
        },
        setItem: async (key: string, value: unknown) => {
          return store.set(key, value);
        },
      },
    }),
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

export async function updateUser(
  user: ZUpdateUserType | Pick<ZUpdatePreferencesType, "language">,
) {
  return await authClient.updateUser({
    ...("firstName" in user && user.firstName && user.lastName
      ? {
          name: `${user.firstName.replace(/\s+/g, "")} ${user.lastName.replace(
            /\s+/g,
            "",
          )}`,
        }
      : {}),
    ...("language" in user && user.language ? { language: user.language } : {}),
  });
}

export async function listSessions() {
  return await authClient.multiSession.listDeviceSessions();
}

export async function getSession() {
  return await authClient.getSession();
}

export async function setSession({ sessionToken }: { sessionToken: string }) {
  return await authClient.multiSession.setActive({ sessionToken });
}
