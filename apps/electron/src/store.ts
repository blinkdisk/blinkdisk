import { ProviderType } from "@config/providers";
import { ConfigLevel } from "@db/enums";
import { EncryptedConfig, EncryptedString } from "@electron/encryption";
import { sendWindow } from "@electron/window";
import { ZStorageOptionsType } from "@schemas/shared/storage";
import Store from "electron-store";

export type GlobalStorageType = {
  authenticated: boolean;
  currentAccountId: string | null;
  preferences: {
    theme: "system" | "dark" | "light";
  };
  storages: {
    [id: string]: {
      version: number;
      configLevel: ConfigLevel;
      provider: ProviderType;
      accountId: string;
      options: ZStorageOptionsType;
      token?: EncryptedString;
    };
  };
  vaults: {
    [id: string]: {
      name: string;
      accountId: string;
      profileId: string;
      deviceId: string;
      storageId: string;
    };
  };
  configs: {
    [id: string]: {
      level: ConfigLevel;
      data: EncryptedConfig;
      accountId: string;
      storageId: string;
      profileId?: string | null;
    };
  };
  passwords: {
    [vaultId: string]: EncryptedString;
  };
};

export type AccountStorageType = {
  active: boolean;
  deviceId: string;
  profileId: string;
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

export const store = new Store();

store.onDidAnyChange(() => {
  sendWindow("store.change");
});
