import { electronClient } from "@better-auth/electron/client";
import { APP_ID, APP_ID_ORIGIN } from "@blinkdisk/constants/app";
import {
  ELECTRON_CLIENT_ID,
  ELECTRON_COOKIE_PREFIX,
} from "@blinkdisk/constants/auth";
import { ZUpdateAccountType } from "@blinkdisk/schemas/accounts";
import { ZUpdatePreferencesType } from "@blinkdisk/schemas/settings";
import { initAccountCollections } from "@electron/db";
import { AccountStorageType, store } from "@electron/store";
import { syncVaults } from "@electron/vault/manage";
import { sendWindow } from "@electron/window";
import { tryCatch } from "@utils/try-catch";
import {
  inferAdditionalFields,
  magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient, SuccessContext } from "better-auth/react";
import { parseSetCookie } from "set-cookie-parser";
import { decryptString, EncryptedString, encryptString } from "./encryption";

export const authClient = createAuthClient({
  baseURL: process.env.API_URL,
  basePath: "/api/auth",
  fetchOptions: {
    headers: {
      origin: APP_ID_ORIGIN,
    },
    onSuccess: (context) => {
      parseCookies(context);
      parseAccount(context);
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

export async function updateAccount(
  user: (ZUpdateAccountType | Pick<ZUpdatePreferencesType, "language">) & {
    id: string;
  },
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
    fetchOptions: {
      headers: getAccountHeaders(user.id),
    },
  });
}

export async function getAccount(accountId: string) {
  const [res] = await tryCatch(
    authClient.getSession({
      fetchOptions: {
        headers: getAccountHeaders(accountId),
      },
    }),
  );

  if (res?.data?.user) return res.data.user;

  const cached = store.get(
    `accounts.${accountId}.data`,
  ) as AccountStorageType["data"];

  if (cached) return cached;

  return null;
}

export async function openAuth() {
  return await authClient.requestAuth();
}

export async function logout(accountId: string) {
  const session = store.get(`accounts.${accountId}.session.token`) as
    | string
    | null;

  if (session)
    await authClient.revokeSession({
      token: session,
      fetchOptions: {
        headers: getAccountHeaders(accountId),
      },
    });

  store.set(`accounts.${accountId}.active`, false);
}

export async function authenticateToken({ token }: { token: string }) {
  const { data, error } = await authClient.authenticate({
    token,
  });

  if (error) throw new Error(error.message);

  const accountId = data?.user?.id;
  if (!accountId) throw new Error("No account ID found");

  await initAccountCollections(accountId);

  store.set(`accounts.${accountId}.active`, true);

  // We need to sync all vaults as the
  // account may have been inactive before
  await syncVaults();

  sendWindow("auth.onAccountAdd", {
    accountId,
  });

  return data;
}

export function getAccountCookie(accountId: string) {
  const encrypted = store.get(
    `accounts.${accountId}.secret`,
  ) as EncryptedString | null;
  if (!encrypted) return null;

  const decrypted = decryptString(encrypted, null);
  if (!decrypted) return null;

  return `__Secure-${ELECTRON_COOKIE_PREFIX}.session_token=${decrypted}`;
}

function getAccountHeaders(accountId: string) {
  return {
    origin: APP_ID_ORIGIN,
    Cookie: getAccountCookie(accountId) || "",
  };
}

export function storeToken(accountId: string, token: string) {
  const session = token.split(".")[0];
  store.set(`accounts.${accountId}.session`, session);
  store.set(`accounts.${accountId}.secret`, encryptString(token));
}

function parseAccount(
  // eslint-disable-next-line
  context: SuccessContext<any>,
) {
  if (!context.data?.user?.id) return;

  const account = context.data?.user;
  store.set(`accounts.${account.id}.data`, account);

  const session = context.data?.session;
  if (!session) return;

  store.set(`accounts.${account.id}.session`, session);
}

function parseCookies(
  // eslint-disable-next-line
  context: SuccessContext<any>,
) {
  const setCookie = context.response.headers.get("set-cookie");
  if (!setCookie) return;

  const parsed = parseSetCookie(setCookie);

  const cookie = parsed.find(
    (c) => c.name === `__Secure-${ELECTRON_COOKIE_PREFIX}.session_token`,
  );
  if (!cookie) return;

  const accountId = context.data?.user?.id;
  if (!accountId) return;

  storeToken(accountId, cookie.value);
}
