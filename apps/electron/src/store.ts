import { EncryptedString } from "@electron/encryption";
import { globalConfigDirectory } from "@electron/path";
import { initVaults } from "@electron/vault/manage";
import { sendWindow } from "@electron/window";
import { app } from "electron";
import Store from "electron-store";

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
  migrations: {
    id: string;
    completedAt: string | Date;
  }[];
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
});

store.onDidAnyChange(() => {
  sendWindow("store.change");
});

store.onDidChange("accounts", (newValue, oldValue) => {
  if (!newValue || !oldValue) {
    initVaults();
    return;
  }

  const oldActiveCount = Object.values(oldValue).filter(
    (a) => !!a.active,
  ).length;

  const newActiveCount = Object.values(newValue).filter(
    (a) => !!a.active,
  ).length;

  if (oldActiveCount !== newActiveCount) initVaults();
});
