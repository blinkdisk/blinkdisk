import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestQueryClient, createWrapper } from "@desktop/test/test-utils";
import { useCreateFolder } from "./use-create-folder";
import { vaultApi } from "@desktop/lib/vault";
import { tryCatch } from "@utils/try-catch";

// Mock dependencies
vi.mock("@desktop/lib/vault");
vi.mock("@desktop/lib/error");
vi.mock("@desktop/lib/folder", () => ({
  hashFolder: vi.fn().mockResolvedValue("hashed-folder-id"),
}));
vi.mock("@utils/try-catch");
vi.mock("posthog-js/react", () => ({
  usePostHog: () => ({
    capture: vi.fn(),
  }),
}));

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@desktop/hooks/use-vault-id", () => ({
  useVaultId: () => ({ vaultId: "test-vault-id" }),
}));

vi.mock("@desktop/hooks/use-device", () => ({
  useDevice: () => ({ deviceId: "test-device-id" }),
}));

vi.mock("@desktop/hooks/use-profile", () => ({
  useProfile: () => ({ profileId: "test-profile-id" }),
}));

vi.mock("@desktop/hooks/use-query-key", () => ({
  useQueryKey: () => ({
    queryKeys: {
      folder: {
        list: (vaultId?: string) => ["folder", "list", vaultId],
      },
      policy: {
        folders: () => ["policy", "folders"],
      },
    },
  }),
}));

vi.mock("@desktop/hooks/queries/use-vault", () => ({
  useVault: () => ({
    data: {
      id: "test-vault-id",
      provider: "BLINKDISK_CLOUD",
    },
  }),
}));

vi.mock("@desktop/hooks/queries/use-vault-space", () => ({
  useVaultSpace: () => ({
    data: {
      capacity: 10737418240, // 10GB
      used: 5368709120, // 5GB
    },
  }),
}));

describe("useCreateFolder", () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Setup default window.electron mock
    (window as any).electron = {
      fs: {
        folderSize: vi.fn().mockResolvedValue(1048576), // 1MB
      },
    };
  });

  describe("Validation", () => {
    it("should throw error when vaultId is missing", async () => {
      vi.mock("@desktop/hooks/use-vault-id", () => ({
        useVaultId: () => ({ vaultId: undefined }),
      }));

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: null,
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it("should throw error when deviceId is missing", async () => {
      vi.mock("@desktop/hooks/use-device", () => ({
        useDevice: () => ({ deviceId: undefined }),
      }));

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: null,
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it("should throw error when profileId is missing", async () => {
      vi.mock("@desktop/hooks/use-profile", () => ({
        useProfile: () => ({ profileId: undefined }),
      }));

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: null,
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });
  });

  describe("Size validation for BLINKDISK_CLOUD", () => {
    beforeEach(() => {
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);
    });

    it("should use provided size when available", async () => {
      const providedSize = 2097152; // 2MB
      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: providedSize,
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      // Should not call window.electron.fs.folderSize when size is provided
      expect((window as any).electron.fs.folderSize).not.toHaveBeenCalled();
    });

    it("should calculate size when not provided", async () => {
      const calculatedSize = 3145728; // 3MB
      (window as any).electron.fs.folderSize = vi
        .fn()
        .mockResolvedValue(calculatedSize);
      vi.mocked(tryCatch).mockResolvedValue([calculatedSize, null]);

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: null,
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("should throw FOLDER_TOO_LARGE error when size exceeds available space", async () => {
      const tooLargeSize = 10737418240; // 10GB (more than 5GB available)
      
      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: tooLargeSize,
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "FOLDER_TOO_LARGE",
          }),
        );
      });
    });

    it("should proceed when size is within available space", async () => {
      const validSize = 1073741824; // 1GB (less than 5GB available)
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: validSize,
      });

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/api/v1/sources", {
          path: "/test/path",
          createSnapshot: false,
          policy: {
            name: "Test Folder",
            emoji: "📁",
          },
        });
      });
    });

    it("should bypass size check when force is true", async () => {
      const tooLargeSize = 10737418240; // 10GB
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: tooLargeSize,
        force: true,
      });

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalled();
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("should handle size calculation failure gracefully", async () => {
      vi.mocked(tryCatch).mockResolvedValue([null, new Error("Failed")]);
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: null,
      });

      await waitFor(() => {
        // Should proceed even if size calculation fails
        expect(mockPost).toHaveBeenCalled();
      });
    });
  });

  describe("Non-BLINKDISK_CLOUD providers", () => {
    it("should skip size validation for non-cloud providers", async () => {
      vi.mock("@desktop/hooks/queries/use-vault", () => ({
        useVault: () => ({
          data: {
            id: "test-vault-id",
            provider: "FILESYSTEM",
          },
        }),
      }));

      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: null,
      });

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalled();
      });

      expect((window as any).electron.fs.folderSize).not.toHaveBeenCalled();
    });
  });

  describe("API interaction", () => {
    beforeEach(() => {
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);
    });

    it("should call vaultApi with correct parameters", async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "My Folder",
        emoji: "🎨",
        path: "/home/user/documents",
        size: 1048576,
      });

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/api/v1/sources", {
          path: "/home/user/documents",
          createSnapshot: false,
          policy: {
            name: "My Folder",
            emoji: "🎨",
          },
        });
      });
    });

    it("should include folderMockPolicy when available", async () => {
      const mockPolicy = {
        retention: { latest: 5 },
      };
      (window as any).folderMockPolicy = mockPolicy;

      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: 1048576,
      });

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/api/v1/sources", {
          path: "/test/path",
          createSnapshot: false,
          policy: {
            ...mockPolicy,
            name: "Test Folder",
            emoji: "📁",
          },
        });
      });
    });

    it("should handle API errors", async () => {
      const apiError = new Error("API Error");
      const mockPost = vi.fn().mockRejectedValue(apiError);
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: 1048576,
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(apiError);
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Success handling", () => {
    beforeEach(() => {
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);
    });

    it("should invalidate folder list queries on success", async () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: 1048576,
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ["folder", "list", "test-vault-id"],
        });
      });
    });

    it("should invalidate policy folders queries on success", async () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: 1048576,
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ["policy", "folders"],
        });
      });
    });

    it("should navigate to folder page on success", async () => {
      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: 1048576,
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          to: "/app/{-$deviceId}/{-$profileId}/{-$vaultId}/{-$folderId}",
          params: expect.any(Function),
        });
      });
    });

    it("should call onSuccess callback", async () => {
      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: 1048576,
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("Error handling", () => {
    it("should not show error toast for FOLDER_TOO_LARGE", async () => {
      const showErrorToast = vi.fn();
      vi.mock("@desktop/lib/error", () => ({
        showErrorToast,
      }));

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: 10737418240, // Too large
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "FOLDER_TOO_LARGE",
          }),
        );
      });

      // FOLDER_TOO_LARGE should not trigger error toast
      expect(showErrorToast).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    beforeEach(() => {
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);
    });

    it("should handle zero size", async () => {
      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Empty Folder",
        emoji: "📁",
        path: "/test/empty",
        size: 0,
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("should handle exact available space", async () => {
      const exactSize = 5368709120; // Exactly 5GB available
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path",
        size: exactSize,
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("should handle paths with special characters", async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "Test Folder",
        emoji: "📁",
        path: "/test/path with spaces/and (parentheses)",
        size: 1048576,
      });

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith(
          "/api/v1/sources",
          expect.objectContaining({
            path: "/test/path with spaces/and (parentheses)",
          }),
        );
      });
    });

    it("should handle emoji in folder names", async () => {
      const mockPost = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(vaultApi).mockReturnValue({
        post: mockPost,
      } as any);

      const { result } = renderHook(
        () =>
          useCreateFolder({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
          }),
        {
          wrapper: createWrapper(queryClient),
        },
      );

      result.current.mutate({
        name: "My Folder 📂",
        emoji: "🎉",
        path: "/test/path",
        size: 1048576,
      });

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith(
          "/api/v1/sources",
          expect.objectContaining({
            policy: expect.objectContaining({
              name: "My Folder 📂",
              emoji: "🎉",
            }),
          }),
        );
      });
    });
  });
});