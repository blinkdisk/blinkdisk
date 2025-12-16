import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestQueryClient, createWrapper } from "@desktop/test/test-utils";
import { useFolderSize, TaskInfo, TaskStatus } from "./use-folder-size";
import { vaultApi } from "@desktop/lib/vault";

// Mock dependencies
vi.mock("@desktop/lib/vault");
vi.mock("@desktop/hooks/use-vault-id", () => ({
  useVaultId: () => ({ vaultId: "test-vault-id" }),
}));
vi.mock("@desktop/hooks/use-query-key", () => ({
  useQueryKey: () => ({
    queryKeys: {
      folder: {
        size: (vaultId?: string, taskId?: string | null) => [
          "test-account-id",
          "folder",
          vaultId,
          "size",
          taskId,
        ],
      },
    },
    accountId: "test-account-id",
  }),
}));

describe("useFolderSize", () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  const mockTaskInfo: TaskInfo = {
    id: "task-123",
    startTime: "2024-01-01T00:00:00Z",
    kind: "estimate",
    description: "Folder size estimation",
    status: "SUCCESS" as TaskStatus,
    progressInfo: "Complete",
    counters: {
      Files: { value: 100 },
      Directories: { value: 10 },
      Bytes: { value: 1048576 }, // 1MB
      "Excluded Files": { value: 5 },
      "Excluded Directories": { value: 2 },
      "Excluded Bytes": { value: 512 },
    },
  };

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.result).toBeNull();
    });

    it("should not start estimation automatically", () => {
      const mockPost = vi.fn();
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe("startEstimation", () => {
    it("should throw error when vaultId is missing", async () => {
      vi.mock("@desktop/hooks/use-vault-id", () => ({
        useVaultId: () => ({ vaultId: undefined }),
      }));

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it("should throw error when path is empty", async () => {
      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it("should successfully start estimation with valid inputs", async () => {
      const mockPost = vi.fn().mockResolvedValue({
        data: { ...mockTaskInfo, status: "RUNNING" as TaskStatus },
      });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: vi.fn(),
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/api/v1/estimate", {
          root: "/test/path",
          maxExamplesPerBucket: 10,
          policyOverride: {},
        });
      });
    });

    it("should send policy override when policy is provided", async () => {
      const mockPost = vi.fn().mockResolvedValue({
        data: { ...mockTaskInfo, status: "RUNNING" as TaskStatus },
      });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: vi.fn(),
      } as any);

      const mockPolicy = {
        name: "Test Policy",
        emoji: "📁",
        files: {
          denylist: [{ expression: "*.tmp" }],
        },
      };

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: mockPolicy as any,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalled();
        const callArgs = mockPost.mock.calls[0];
        expect(callArgs[1].policyOverride).toBeDefined();
      });
    });

    it("should handle API error gracefully", async () => {
      const mockPost = vi
        .fn()
        .mockRejectedValue(new Error("API request failed"));
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeDefined();
      });
    });

    it("should throw error when response data is missing", async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: null });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe("Task polling", () => {
    it("should poll task status when estimation is running", async () => {
      const runningTask = { ...mockTaskInfo, status: "RUNNING" as TaskStatus };
      const mockPost = vi.fn().mockResolvedValue({ data: runningTask });
      const mockGet = vi.fn().mockResolvedValue({ data: runningTask });

      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: mockGet,
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isRunning).toBe(true);
      });
    });

    it("should stop polling when task completes successfully", async () => {
      const runningTask = { ...mockTaskInfo, status: "RUNNING" as TaskStatus };
      const completedTask = {
        ...mockTaskInfo,
        status: "SUCCESS" as TaskStatus,
        endTime: "2024-01-01T00:01:00Z",
      };

      const mockPost = vi.fn().mockResolvedValue({ data: runningTask });
      const mockGet = vi
        .fn()
        .mockResolvedValueOnce({ data: runningTask })
        .mockResolvedValueOnce({ data: completedTask });

      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: mockGet,
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isRunning).toBe(false);
    });

    it("should handle task failure", async () => {
      const runningTask = { ...mockTaskInfo, status: "RUNNING" as TaskStatus };
      const failedTask = {
        ...mockTaskInfo,
        status: "FAILURE" as TaskStatus,
        endTime: "2024-01-01T00:01:00Z",
      };

      const mockPost = vi.fn().mockResolvedValue({ data: runningTask });
      const mockGet = vi
        .fn()
        .mockResolvedValueOnce({ data: runningTask })
        .mockResolvedValueOnce({ data: failedTask });

      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: mockGet,
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
      });
    });
  });

  describe("Result computation", () => {
    it("should compute result from counters correctly", async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: mockTaskInfo });
      const mockGet = vi.fn().mockResolvedValue({ data: mockTaskInfo });

      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: mockGet,
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.result).toEqual({
        included: {
          files: 100,
          directories: 10,
          bytes: 1048576,
        },
        excluded: {
          files: 5,
          directories: 2,
          bytes: 512,
        },
      });
    });

    it("should handle missing counters with default values", async () => {
      const taskWithoutCounters = {
        ...mockTaskInfo,
        counters: {
          Files: { value: 50 },
          // Missing other counters
        },
      };

      const mockPost = vi.fn().mockResolvedValue({ data: taskWithoutCounters });
      const mockGet = vi.fn().mockResolvedValue({ data: taskWithoutCounters });

      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: mockGet,
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.result).toEqual({
        included: {
          files: 50,
          directories: 0,
          bytes: 0,
        },
        excluded: {
          files: 0,
          directories: 0,
          bytes: 0,
        },
      });
    });

    it("should return null when counters are null", async () => {
      const taskWithNullCounters = {
        ...mockTaskInfo,
        counters: null,
      };

      const mockPost = vi
        .fn()
        .mockResolvedValue({ data: taskWithNullCounters });
      const mockGet = vi.fn().mockResolvedValue({ data: taskWithNullCounters });

      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: mockGet,
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.result).toBeNull();
    });
  });

  describe("Path and policy change handling", () => {
    it("should reset taskId when path changes", async () => {
      const { result, rerender } = renderHook(
        ({ path }) =>
          useFolderSize({
            path,
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
          initialProps: { path: "/test/path1" },
        },
      );

      // Trigger initial estimation
      const mockPost = vi.fn().mockResolvedValue({ data: mockTaskInfo });
      const mockGet = vi.fn().mockResolvedValue({ data: mockTaskInfo });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: mockGet,
      } as any);

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Change path
      rerender({ path: "/test/path2" });

      // Should reset state
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.result).toBeNull();
      });
    });

    it("should reset taskId when policy files change", async () => {
      const policy1 = {
        name: "Policy 1",
        emoji: "📁",
        files: { denylist: [{ expression: "*.tmp" }] },
      };

      const policy2 = {
        name: "Policy 2",
        emoji: "📁",
        files: { denylist: [{ expression: "*.log" }] },
      };

      const { result, rerender } = renderHook(
        ({ policy }) =>
          useFolderSize({
            path: "/test/path",
            policy: policy as any,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
          initialProps: { policy: policy1 },
        },
      );

      const mockPost = vi.fn().mockResolvedValue({ data: mockTaskInfo });
      const mockGet = vi.fn().mockResolvedValue({ data: mockTaskInfo });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: mockGet,
      } as any);

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Change policy
      rerender({ policy: policy2 });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
      });
    });

    it("should invalidate queries when path changes", async () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { rerender } = renderHook(
        ({ path }) =>
          useFolderSize({
            path,
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
          initialProps: { path: "/test/path1" },
        },
      );

      rerender({ path: "/test/path2" });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalled();
      });
    });
  });

  describe("Enabled flag", () => {
    it("should not query when enabled is false", () => {
      const mockGet = vi.fn();
      vi.mocked(vaultApi).mockReturnValue({
        get: mockGet,
      } as any);

      renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: false,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should not query when accountId is missing", () => {
      vi.mock("@desktop/hooks/use-query-key", () => ({
        useQueryKey: () => ({
          queryKeys: {
            folder: {
              size: () => ["folder", "size"],
            },
          },
          accountId: undefined,
        }),
      }));

      const mockGet = vi.fn();
      vi.mocked(vaultApi).mockReturnValue({
        get: mockGet,
      } as any);

      renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("Loading states", () => {
    it("should show isLoading during mutation", async () => {
      const mockPost = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      expect(result.current.isLoading).toBe(true);
    });

    it("should show isRunning when task status is RUNNING", async () => {
      const runningTask = { ...mockTaskInfo, status: "RUNNING" as TaskStatus };
      const mockPost = vi.fn().mockResolvedValue({ data: runningTask });
      const mockGet = vi.fn().mockResolvedValue({ data: runningTask });

      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: mockGet,
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isRunning).toBe(true);
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle zero values in counters", async () => {
      const emptyTask = {
        ...mockTaskInfo,
        counters: {
          Files: { value: 0 },
          Directories: { value: 0 },
          Bytes: { value: 0 },
          "Excluded Files": { value: 0 },
          "Excluded Directories": { value: 0 },
          "Excluded Bytes": { value: 0 },
        },
      };

      const mockPost = vi.fn().mockResolvedValue({ data: emptyTask });
      const mockGet = vi.fn().mockResolvedValue({ data: emptyTask });

      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: mockGet,
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.result).toEqual({
        included: {
          files: 0,
          directories: 0,
          bytes: 0,
        },
        excluded: {
          files: 0,
          directories: 0,
          bytes: 0,
        },
      });
    });

    it("should handle very large byte values", async () => {
      const largeTask = {
        ...mockTaskInfo,
        counters: {
          Files: { value: 999999 },
          Directories: { value: 99999 },
          Bytes: { value: 1099511627776 }, // 1TB
          "Excluded Files": { value: 100000 },
          "Excluded Directories": { value: 10000 },
          "Excluded Bytes": { value: 107374182400 }, // 100GB
        },
      };

      const mockPost = vi.fn().mockResolvedValue({ data: largeTask });
      const mockGet = vi.fn().mockResolvedValue({ data: largeTask });

      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
        get: mockGet,
      } as any);

      const { result } = renderHook(
        () =>
          useFolderSize({
            path: "/test/path",
            policy: null,
            enabled: true,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.startEstimation();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.result?.included.bytes).toBe(1099511627776);
      expect(result.current.result?.excluded.bytes).toBe(107374182400);
    });
  });
});