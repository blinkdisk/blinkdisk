import { usePlatform } from "@desktop/hooks/queries/use-platform";
import { useOnboarding } from "@desktop/hooks/state/use-onboarding";
import {
  buildSuggestedFolders,
  type FolderSizes,
  resolveFolders,
  summarizeSelection,
} from "@desktop/lib/onboarding";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

function useFolderSizes(paths: string[], enabled: boolean) {
  return useQueries({
    queries: paths.map((path) => ({
      queryKey: ["onboarding", "folder-size", path],
      queryFn: () => window.electron.fs.folderSize(path),
      staleTime: Number.POSITIVE_INFINITY,
      retry: false,
      enabled,
    })),
    combine: (results): FolderSizes =>
      Object.fromEntries(
        paths.map((path, index) => [path, results[index]?.data]),
      ),
  });
}

export function useOnboardingFolders() {
  const { view, selection, customPaths } = useOnboarding();
  const { data: platform } = usePlatform();

  const { data: suggested } = useQuery({
    queryKey: ["onboarding", "suggested-folders"],
    queryFn: async () =>
      buildSuggestedFolders(await window.electron.fs.suggestedFolders()),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const folders = useMemo(
    () =>
      suggested ? resolveFolders(suggested, customPaths, selection) : undefined,
    [suggested, customPaths, selection],
  );
  const selected = useMemo(
    () => (folders || []).filter((folder) => folder.selected),
    [folders],
  );
  const selectedPaths = useMemo(
    () => selected.map((folder) => folder.path),
    [selected],
  );

  // Reading a folder makes macOS ask for access to it, so wait there until
  // the folders are confirmed instead of prompting for every suggestion.
  const isMeasuring =
    platform === "macos"
      ? view !== "welcome" && view !== "folders"
      : platform !== undefined && view !== "welcome";

  const sizes = useFolderSizes(selectedPaths, isMeasuring);
  const summary = useMemo(
    () => summarizeSelection(folders, sizes),
    [folders, sizes],
  );

  return { folders, selected, sizes, summary, isMeasuring };
}
