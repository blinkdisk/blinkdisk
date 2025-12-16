import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useQueryKey } from "./use-query-key";

// Mock dependencies
vi.mock("@desktop/hooks/use-account-id", () => ({
  useAccountId: () => ({ accountId: "test-account-id" }),
}));

describe("useQueryKey", () => {
  describe("Basic functionality", () => {
    it("should return queryKeys object", () => {
      const { result } = renderHook(() => useQueryKey());

      expect(result.current.queryKeys).toBeDefined();
      expect(result.current.accountId).toBe("test-account-id");
    });

    it("should memoize queryKeys based on accountId", () => {
      const { result, rerender } = renderHook(() => useQueryKey());

      const firstKeys = result.current.queryKeys;
      rerender();
      const secondKeys = result.current.queryKeys;

      expect(firstKeys).toBe(secondKeys);
    });
  });

  describe("Folder query keys", () => {
    it("should generate folder.all key", () => {
      const { result } = renderHook(() => useQueryKey());

      expect(result.current.queryKeys.folder.all).toEqual([
        "test-account-id",
        "folder",
      ]);
    });

    it("should generate folder.list key with vaultId", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.folder.list("vault-123");
      expect(key).toEqual(["test-account-id", "folder", "list", "vault-123"]);
    });

    it("should generate folder.list key without vaultId", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.folder.list();
      expect(key).toEqual(["test-account-id", "folder", "list", undefined]);
    });

    it("should generate folder.restores key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.folder.restores("folder-456");
      expect(key).toEqual([
        "test-account-id",
        "folder",
        "folder-456",
        "restores",
      ]);
    });

    it("should generate folder.size key with both vaultId and taskId", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.folder.size("vault-123", "task-789");
      expect(key).toEqual([
        "test-account-id",
        "folder",
        "vault-123",
        "size",
        "task-789",
      ]);
    });

    it("should generate folder.size key with only vaultId", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.folder.size("vault-123");
      expect(key).toEqual([
        "test-account-id",
        "folder",
        "vault-123",
        "size",
        undefined,
      ]);
    });

    it("should generate folder.size key with null taskId", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.folder.size("vault-123", null);
      expect(key).toEqual([
        "test-account-id",
        "folder",
        "vault-123",
        "size",
        null,
      ]);
    });

    it("should generate folder.size key without any parameters", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.folder.size();
      expect(key).toEqual([
        "test-account-id",
        "folder",
        undefined,
        "size",
        undefined,
      ]);
    });
  });

  describe("Vault query keys", () => {
    it("should generate vault.all key", () => {
      const { result } = renderHook(() => useQueryKey());

      expect(result.current.queryKeys.vault.all).toEqual([
        "test-account-id",
        "vault",
      ]);
    });

    it("should generate vault.detail key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.vault.detail("vault-123");
      expect(key).toEqual(["test-account-id", "vault", "vault-123"]);
    });

    it("should generate vault.space key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.vault.space("vault-123");
      expect(key).toEqual(["test-account-id", "vault", "vault-123", "space"]);
    });
  });

  describe("Policy query keys", () => {
    it("should generate policy.all key", () => {
      const { result } = renderHook(() => useQueryKey());

      expect(result.current.queryKeys.policy.all).toEqual([
        "test-account-id",
        "policy",
      ]);
    });

    it("should generate policy.vault key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.policy.vault("vault-123");
      expect(key).toEqual(["test-account-id", "policy", "vault-123"]);
    });

    it("should generate policy.folders key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.policy.folders();
      expect(key).toEqual(["test-account-id", "policy", "folder"]);
    });

    it("should generate policy.folder key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.policy.folder("folder-456");
      expect(key).toEqual([
        "test-account-id",
        "policy",
        "folder",
        "folder-456",
      ]);
    });
  });

  describe("Account query keys", () => {
    it("should generate account.all key", () => {
      const { result } = renderHook(() => useQueryKey());

      expect(result.current.queryKeys.account.all).toEqual(["account"]);
    });

    it("should generate account.list key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.account.list();
      expect(key).toEqual(["account", "list"]);
    });

    it("should generate account.detail key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.account.detail();
      expect(key).toEqual(["account"]);
    });
  });

  describe("Device query keys", () => {
    it("should generate device.all key", () => {
      const { result } = renderHook(() => useQueryKey());

      expect(result.current.queryKeys.device.all).toEqual([
        "test-account-id",
        "device",
      ]);
    });

    it("should generate device.list key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.device.list();
      expect(key).toEqual(["test-account-id", "device", "list"]);
    });

    it("should generate device.profiles key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.device.profiles("device-123");
      expect(key).toEqual([
        "test-account-id",
        "device",
        "list",
        "device-123",
      ]);
    });
  });

  describe("Directory query keys", () => {
    it("should generate directory.all key", () => {
      const { result } = renderHook(() => useQueryKey());

      expect(result.current.queryKeys.directory.all).toEqual(["directory"]);
    });

    it("should generate directory.empty key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.directory.empty("/test/path");
      expect(key).toEqual(["directory", "empty", "/test/path"]);
    });

    it("should generate directory.detail key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.directory.detail("dir-123");
      expect(key).toEqual(["directory", "dir-123"]);
    });

    it("should generate directory.mount key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.directory.mount("root-123");
      expect(key).toEqual(["directory", "root-123", "mount"]);
    });
  });

  describe("Backup query keys", () => {
    it("should generate backup.all key", () => {
      const { result } = renderHook(() => useQueryKey());

      expect(result.current.queryKeys.backup.all).toEqual([
        "test-account-id",
        "backup",
      ]);
    });

    it("should generate backup.list key", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.backup.list("folder-456");
      expect(key).toEqual(["test-account-id", "backup", "list", "folder-456"]);
    });
  });

  describe("AccountId changes", () => {
    it("should update queryKeys when accountId changes", () => {
      let accountId = "account-1";
      vi.mock("@desktop/hooks/use-account-id", () => ({
        useAccountId: () => ({ accountId }),
      }));

      const { result, rerender } = renderHook(() => useQueryKey());

      const firstKeys = result.current.queryKeys;
      expect(firstKeys.folder.all).toEqual([accountId, "folder"]);

      accountId = "account-2";
      rerender();

      const secondKeys = result.current.queryKeys;
      expect(secondKeys).not.toBe(firstKeys);
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined accountId", () => {
      vi.mock("@desktop/hooks/use-account-id", () => ({
        useAccountId: () => ({ accountId: undefined }),
      }));

      const { result } = renderHook(() => useQueryKey());

      expect(result.current.queryKeys.folder.all).toEqual([undefined, "folder"]);
      expect(result.current.accountId).toBeUndefined();
    });

    it("should handle empty string vaultId", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.folder.size("");
      expect(key).toEqual(["test-account-id", "folder", "", "size", undefined]);
    });

    it("should handle special characters in IDs", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.folder.size(
        "vault-with-dashes-123",
        "task_with_underscores_456",
      );
      expect(key).toEqual([
        "test-account-id",
        "folder",
        "vault-with-dashes-123",
        "size",
        "task_with_underscores_456",
      ]);
    });

    it("should handle numeric IDs as strings", () => {
      const { result } = renderHook(() => useQueryKey());

      const key = result.current.queryKeys.folder.size("123", "456");
      expect(key).toEqual(["test-account-id", "folder", "123", "size", "456"]);
    });
  });

  describe("Key consistency", () => {
    it("should maintain consistent key structure across multiple calls", () => {
      const { result } = renderHook(() => useQueryKey());

      const key1 = result.current.queryKeys.folder.size("vault-123", "task-789");
      const key2 = result.current.queryKeys.folder.size("vault-123", "task-789");

      expect(key1).toEqual(key2);
    });

    it("should differentiate keys with different parameters", () => {
      const { result } = renderHook(() => useQueryKey());

      const key1 = result.current.queryKeys.folder.size("vault-123", "task-789");
      const key2 = result.current.queryKeys.folder.size("vault-456", "task-789");

      expect(key1).not.toEqual(key2);
    });

    it("should differentiate keys with null vs undefined", () => {
      const { result } = renderHook(() => useQueryKey());

      const keyWithNull = result.current.queryKeys.folder.size("vault-123", null);
      const keyWithUndefined = result.current.queryKeys.folder.size("vault-123");

      expect(keyWithNull[4]).toBeNull();
      expect(keyWithUndefined[4]).toBeUndefined();
    });
  });

  describe("Hierarchical key structure", () => {
    it("should maintain hierarchy from all to specific", () => {
      const { result } = renderHook(() => useQueryKey());

      const allKey = result.current.queryKeys.folder.all;
      const sizeKey = result.current.queryKeys.folder.size("vault-123", "task-789");

      // Size key should start with all key
      expect(sizeKey.slice(0, allKey.length)).toEqual(allKey);
    });

    it("should allow invalidation of all folder queries via folder.all", () => {
      const { result } = renderHook(() => useQueryKey());

      const allKey = result.current.queryKeys.folder.all;
      const listKey = result.current.queryKeys.folder.list("vault-123");
      const sizeKey = result.current.queryKeys.folder.size("vault-123", "task-789");

      // All folder-related keys should start with folder.all
      expect(listKey.slice(0, allKey.length)).toEqual(allKey);
      expect(sizeKey.slice(0, allKey.length)).toEqual(allKey);
    });
  });
});