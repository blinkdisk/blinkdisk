import { EncryptedString } from "@electron/encryption";
import { sendWindow } from "@electron/window";
import { app } from "electron";
import Store from "electron-store";
import { globalConfigDirectory } from "./path";

export type GlobalStorageType = {
  authenticated: boolean;
  currentAccountId: string | null;
  preferences: {
    theme: "system" | "dark" | "light";
  };
  passwords: {
    [vaultId: string]: EncryptedString;
  };
  auth: {
    // Managed by better-auth
    cookie: string;
    // Managed by better-auth
    local_cache: string;
  };
};

export type AccountStorageType = {
  active: boolean;
  lastUsedVaultId?: string | null;
  session?: {
    id: string;
    userId: string;
    token: string;
    expiresAt: string | Date;
    createdAt: string | Date;
    updatedAt: string | Date;
    ipAddress: string;
    userAgent: string;
  } | null;
  data?: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    language?: string | null;
    timeZone?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  } | null;
  secret?: EncryptedString | null;
};

Store.initRenderer();

type DotPrefix<TPrefix extends string, TKey extends string> = TPrefix extends ""
  ? TKey
  : `${TPrefix}.${TKey}`;

type Prev = [never, 0, 1, 2, 3, 4, 5]; // You can extend this for more depth

type DotNotation<T, TPrefix extends string = "", D extends number = 5> = [
  D,
] extends [never]
  ? object
  : {
      [K in keyof T & string]: T[K] extends object
        ? // eslint-disable-next-line
          T[K] extends Array<any>
          ? { [P in DotPrefix<TPrefix, K>]: T[K] }
          : { [P in DotPrefix<TPrefix, K>]: T[K] } & DotNotation<
              T[K],
              DotPrefix<TPrefix, K>,
              Prev[D]
            >
        : { [P in DotPrefix<TPrefix, K>]: T[K] };
    }[keyof T & string];

// eslint-disable-next-line
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type GlobalStorageSchema = UnionToIntersection<
  DotNotation<GlobalStorageType>
>;
export type AccountStorageSchema = UnionToIntersection<
  DotNotation<AccountStorageType>
>;

export const store = new Store({
  ...(!app.isPackaged
    ? {
        cwd: globalConfigDirectory(),
      }
    : {}),
  migrations: {
    ">0.7.0": (store) => {
      const accounts = store.get("accounts") || {};

      Object.entries(accounts).forEach(([id, account]) => {
        delete account.profileId;
        delete account.deviceId;

        if (
          account.lastUsedVaultId &&
          account.lastUsedVaultId.startsWith("strg_")
        )
          account.lastUsedVaultId = account.lastUsedVaultId.replace(
            /^strg_/,
            "vlt_",
          );

        store.set(`accounts.${id}`, account);
      });

      const passwords = store.get("passwords") || {};
      store.set("passwords", {});

      Object.entries(passwords).forEach(([id, password]) => {
        if (id.startsWith("strg_")) id = id.replace(/^strg_/, "vlt_");
        store.set(`passwords.${id}`, password);
      });

      store.delete("storages");
      store.delete("configs");
      store.delete("vaults");
    },
    ">1.3.0": (store) => {
      store.delete("configs");
    },
    ">1.7.0": (store) => {
      store.delete("vaults");
    },
  },
});

store.onDidAnyChange(() => {
  sendWindow("store.change");
});
