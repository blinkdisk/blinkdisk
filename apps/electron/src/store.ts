import { ProviderType } from "@config/providers";
import { ConfigLevel } from "@db/enums";
import { EncryptedConfig, EncryptedString } from "@electron/encryption";
import { sendWindow } from "@electron/window";
import { ZVaultOptionsType } from "@schemas/shared/vault";
import Store from "electron-store";

export type GlobalStorageType = {
  authenticated: boolean;
  currentAccountId: string | null;
  preferences: {
    theme: "system" | "dark" | "light";
  };
  vaults: {
    [id: string]: {
      name: string;
      accountId: string;
      configLevel: ConfigLevel;
      options: ZVaultOptionsType;
      token?: EncryptedString;
      version: number;
      provider: ProviderType;
    };
  };
  configs: {
    [id: string]: {
      level: ConfigLevel;
      data: EncryptedConfig;
      accountId: string;
      vaultId: string;
      userName?: string | null;
      hostName?: string | null;
    };
  };
  passwords: {
    [vaultId: string]: EncryptedString;
  };
};

export type AccountStorageType = {
  active: boolean;
  lastUsedVaultId?: string | null;
};

Store.initRenderer();

type DotPrefix<TPrefix extends string, TKey extends string> = TPrefix extends ""
  ? TKey
  : `${TPrefix}.${TKey}`;

type Prev = [never, 0, 1, 2, 3, 4, 5]; // You can extend this for more depth

type DotNotation<T, TPrefix extends string = "", D extends number = 5> = [
  D,
] extends [never]
  ? {}
  : {
      [K in keyof T & string]: T[K] extends object
        ? T[K] extends Array<any>
          ? { [P in DotPrefix<TPrefix, K>]: T[K] }
          : { [P in DotPrefix<TPrefix, K>]: T[K] } & DotNotation<
              T[K],
              DotPrefix<TPrefix, K>,
              Prev[D]
            >
        : { [P in DotPrefix<TPrefix, K>]: T[K] };
    }[keyof T & string];

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
  },
});

store.onDidAnyChange(() => {
  sendWindow("store.change");
});
