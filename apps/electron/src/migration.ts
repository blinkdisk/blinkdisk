import { store } from "@electron/store";
import { captureException } from "@sentry/electron/main";
import { safeStorage, session } from "electron";
import { storeToken } from "./auth";
import { log } from "./log";

export async function runMigrations() {
  try {
    await migrateAuthV1();
    await migrateAuthV2();
  } catch (e) {
    captureException(e);
  }
}

async function migrateAuthV1() {
  if (store.get("migrations.auth_v1")) return;

  function complete() {
    store.set("migrations.auth_v1", true);
  }

  if (store.get("auth.cookie")) return complete();

  const cookies = await session.defaultSession.cookies.get({});

  const sessionCookies = cookies.filter((c) =>
    c.name.startsWith("__Secure-blinkdisk.session_token"),
  );

  if (sessionCookies.length === 0) return complete();

  const cookieData: Record<string, { value: string; expires: string }> = {};

  for (const cookie of sessionCookies) {
    const newName = cookie.name.replace(
      "__Secure-blinkdisk.",
      "__Secure-auth.",
    );
    cookieData[newName] = {
      value: cookie.value,
      expires: cookie.expirationDate
        ? new Date(cookie.expirationDate * 1000).toISOString()
        : "",
    };
  }

  const encrypted = safeStorage
    .encryptString(JSON.stringify(cookieData))
    .toString("base64");

  store.set("auth.cookie", encrypted);

  complete();
}

async function migrateAuthV2() {
  if (store.get("migrations.auth_v2")) return;

  try {
    function complete() {
      store.set("migrations.auth_v2", true);
    }

    const encrypted = store.get("auth.cookie") as string;
    if (!encrypted) return complete();

    const decrypted = safeStorage.decryptString(
      Buffer.from(encrypted, "base64"),
    );
    if (!decrypted) return complete();

    const parsed = JSON.parse(decrypted) as {
      [name: string]: {
        value: string;
        expires: string;
      };
    };

    for (const [name, cookie] of Object.entries(parsed)) {
      if (!name.startsWith("__Secure-auth")) continue;
      const cookieString = `__Secure-auth.session_token=${cookie.value}`;

      const res = await fetch(`${process.env.API_URL}/api/auth/get-session`, {
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieString,
        },
      });

      if (!res.ok) continue;

      const data = await res.json();

      const accountId = data?.user.id;
      if (!accountId) continue;

      storeToken(accountId, cookie.value);
      store.set(`accounts.${accountId}.data`, data.user);
      store.set(`accounts.${accountId}.session`, data.session);
    }

    complete();
  } catch (e) {
    log.error("Failed to migrate auth_v2", e);
  }
}
