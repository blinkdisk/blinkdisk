import { electronClient } from "@better-auth/electron/client";
import { APP_ID, APP_ID_ORIGIN } from "@blinkdisk/constants/app";
import {
  ELECTRON_CLIENT_ID,
  ELECTRON_COOKIE_PREFIX,
} from "@blinkdisk/constants/auth";
import {
  ZUpdatePreferencesType,
  ZUpdateUserType,
} from "@blinkdisk/schemas/settings";
import { store } from "@electron/store";
import { sendWindow } from "@electron/window";
import {
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.API_URL,
  basePath: "/api/auth",
  fetchOptions: {
    headers: {
      origin: APP_ID_ORIGIN,
    },
  },
  plugins: [
    electronClient({
      signInURL: `${process.env.WEB_URL}/auth/register`,
      protocol: {
        scheme: APP_ID,
      },
      cookiePrefix: ELECTRON_COOKIE_PREFIX,
      clientID: ELECTRON_CLIENT_ID,
      storagePrefix: "auth",
      storage: {
        getItem: (key: string) => {
          return store.get(key);
        },
        setItem: (key: string, value: unknown) => {
          return store.set(key, value);
        },
      },
      userImageProxy: {
        enabled: false,
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

export async function openAuth() {
  return await authClient.requestAuth();
}

export async function logout() {
  const session = await getSession();
  if (!session.data) throw new Error("No session found");
  return await authClient.revokeSession({ token: session.data?.session.token });
}

export async function authenticateToken({ token }: { token: string }) {
  const res = await authClient.authenticate({
    token,
  });

  if (res.error) throw new Error(res.error.message);

  sendWindow("auth.onAccountChange");
  return res;
}
