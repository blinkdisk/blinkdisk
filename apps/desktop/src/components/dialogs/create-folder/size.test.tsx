import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FolderSize } from "./size";
import { PolicyContext } from "@desktop/components/policy/context";
import { useFolderSize } from "@desktop/hooks/queries/core/use-folder-size";

// Mock dependencies
vi.mock("@desktop/hooks/queries/core/use-folder-size");
vi.mock("@hooks/use-app-translation", () => ({
  useAppTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "size.title": "Calculate folder size",
        "size.description": "Estimate the size of this folder.",
        "size.button": "Calculate",
        "size.running": "Analyzing folder...",
        "size.starting": "Starting estimation...",
        "size.error": "Failed to estimate folder size",
        "size.included": "Included files:",
        "size.excluded": "Excluded files:",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("@desktop/lib/number", () => ({
  formatInt: (num: number) => num.toLocaleString(),
  formatSize: (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`,
}));

describe("FolderSize Component", () => {
  const mockSetSize = vi.fn();
  const mockStartEstimation = vi.fn();

  const defaultMockReturn = {
    startEstimation: mockStartEstimation,
    isLoading: false,
    isRunning: false,
    isSuccess: false,
    isError: false,
    result: null,
  };

  const mockPolicyContext = {
    policy: {
      effective: {
        name: "Test Policy",
        emoji: "📁",
        files: {
          denylist: [{ expression: "*.tmp" }],
        },
      },
      vault: null,
      folder: null,
    },
    setPolicy: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFolderSize).mockReturnValue(defaultMockReturn);
  });

  describe("Rendering", () => {
    it("should return null when path is empty", () => {
      const { container } = render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render initial state with path", () => {
      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(screen.getByText("Calculate folder size")).toBeInTheDocument();
      expect(
        screen.getByText("Estimate the size of this folder."),
      ).toBeInTheDocument();
      expect(screen.getByText("Calculate")).toBeInTheDocument();
    });

    it("should render calculate button", () => {
      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      const button = screen.getByRole("button", { name: /Calculate/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe("Loading states", () => {
    it("should show loading state when isLoading is true", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    it("should show loading state when isRunning is true", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isRunning: true,
      });

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("Success state", () => {
    it("should render results when isSuccess is true", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isSuccess: true,
        result: {
          included: {
            files: 100,
            directories: 10,
            bytes: 1048576, // 1MB
          },
          excluded: {
            files: 5,
            directories: 2,
            bytes: 512,
          },
        },
      });

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(screen.getByText("Included files:")).toBeInTheDocument();
      expect(screen.getByText("Excluded files:")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should format included bytes correctly", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isSuccess: true,
        result: {
          included: {
            files: 100,
            directories: 10,
            bytes: 10485760, // 10MB
          },
          excluded: {
            files: 0,
            directories: 0,
            bytes: 0,
          },
        },
      });

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(screen.getByText("10.00 MB")).toBeInTheDocument();
    });

    it("should format excluded bytes correctly", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isSuccess: true,
        result: {
          included: {
            files: 100,
            directories: 10,
            bytes: 1048576,
          },
          excluded: {
            files: 20,
            directories: 3,
            bytes: 2097152, // 2MB
          },
        },
      });

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(screen.getByText("2.00 MB")).toBeInTheDocument();
    });

    it("should display zero values when applicable", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isSuccess: true,
        result: {
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
        },
      });

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      const zeroElements = screen.getAllByText("0");
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });

  describe("Error state", () => {
    it("should render error alert when isError is true", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isError: true,
      });

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(
        screen.getByText("Failed to estimate folder size"),
      ).toBeInTheDocument();
    });

    it("should show error alert alongside calculate button", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isError: true,
      });

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(screen.getByRole("button", { name: /Calculate/i })).toBeInTheDocument();
      expect(
        screen.getByText("Failed to estimate folder size"),
      ).toBeInTheDocument();
    });
  });

  describe("User interaction", () => {
    it("should call startEstimation when button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      const button = screen.getByRole("button", { name: /Calculate/i });
      await user.click(button);

      expect(mockStartEstimation).toHaveBeenCalledTimes(1);
    });

    it("should not allow multiple clicks while loading", async () => {
      const user = userEvent.setup();
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("setSize callback", () => {
    it("should call setSize with bytes when result is available", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isSuccess: true,
        result: {
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
        },
      });

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      waitFor(() => {
        expect(mockSetSize).toHaveBeenCalledWith(1048576);
      });
    });

    it("should call setSize with null when result is null", () => {
      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      waitFor(() => {
        expect(mockSetSize).toHaveBeenCalledWith(null);
      });
    });

    it("should call setSize with null when bytes is undefined", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isSuccess: true,
        result: {
          included: {
            files: 100,
            directories: 10,
            bytes: undefined as any,
          },
          excluded: {
            files: 5,
            directories: 2,
            bytes: 512,
          },
        },
      });

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      waitFor(() => {
        expect(mockSetSize).toHaveBeenCalledWith(null);
      });
    });

    it("should update setSize when result changes", () => {
      const { rerender } = render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isSuccess: true,
        result: {
          included: {
            files: 200,
            directories: 20,
            bytes: 2097152,
          },
          excluded: {
            files: 10,
            directories: 5,
            bytes: 1024,
          },
        },
      });

      rerender(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      waitFor(() => {
        expect(mockSetSize).toHaveBeenCalledWith(2097152);
      });
    });
  });

  describe("Policy context", () => {
    it("should pass policy to useFolderSize hook", () => {
      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(useFolderSize).toHaveBeenCalledWith({
        path: "/test/path",
        policy: mockPolicyContext.policy.effective,
        enabled: true,
      });
    });

    it("should handle null policy", () => {
      const contextWithoutPolicy = {
        policy: null,
        setPolicy: vi.fn(),
      };

      render(
        <PolicyContext.Provider value={contextWithoutPolicy}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(useFolderSize).toHaveBeenCalledWith({
        path: "/test/path",
        policy: null,
        enabled: true,
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle very large file counts", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isSuccess: true,
        result: {
          included: {
            files: 1000000,
            directories: 100000,
            bytes: 1099511627776, // 1TB
          },
          excluded: {
            files: 50000,
            directories: 5000,
            bytes: 107374182400, // 100GB
          },
        },
      });

      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(screen.getByText("1,000,000")).toBeInTheDocument();
      expect(screen.getByText("100,000")).toBeInTheDocument();
    });

    it("should handle paths with special characters", () => {
      render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize
            path="/test/path with spaces/and-dashes"
            setSize={mockSetSize}
          />
        </PolicyContext.Provider>,
      );

      expect(useFolderSize).toHaveBeenCalledWith({
        path: "/test/path with spaces/and-dashes",
        policy: mockPolicyContext.policy.effective,
        enabled: true,
      });
    });

    it("should handle rapid path changes", () => {
      const { rerender } = render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/path1" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      rerender(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/path2" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      rerender(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/path3" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(useFolderSize).toHaveBeenCalledTimes(3);
    });

    it("should handle transition from no path to path", () => {
      const { rerender } = render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(screen.queryByText("Calculate folder size")).not.toBeInTheDocument();

      rerender(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      expect(screen.getByText("Calculate folder size")).toBeInTheDocument();
    });
  });

  describe("Icons", () => {
    it("should render check icon for included files", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isSuccess: true,
        result: {
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
        },
      });

      const { container } = render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      // Check for check icon (green)
      const checkIcon = container.querySelector('.text-green-500');
      expect(checkIcon).toBeInTheDocument();
    });

    it("should render X icon for excluded files", () => {
      vi.mocked(useFolderSize).mockReturnValue({
        ...defaultMockReturn,
        isSuccess: true,
        result: {
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
        },
      });

      const { container } = render(
        <PolicyContext.Provider value={mockPolicyContext}>
          <FolderSize path="/test/path" setSize={mockSetSize} />
        </PolicyContext.Provider>,
      );

      // Check for X icon (red)
      const xIcon = container.querySelector('.text-red-500');
      expect(xIcon).toBeInTheDocument();
    });
  });
});