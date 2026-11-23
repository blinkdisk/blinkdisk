import type {
  SuggestedFolder,
  SuggestedFolderKind,
} from "@blinkdisk/electron/fs";
import type { GlobalStorageType } from "@blinkdisk/electron/store";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import { getBackupIssue } from "@desktop/lib/backup-issue";

export const ONBOARDING_STEPS = [
  "folders",
  "storage",
  "password",
  "backup",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export type OnboardingView =
  | "welcome"
  | "folders"
  | "storage"
  | "provider"
  | "config"
  | "password";

export type OnboardingStorage = "CLOUDBLINK" | "CUSTOM";

export type OnboardingRecord = GlobalStorageType["onboarding"];

export type OnboardingFolder = {
  path: string;
  name: string;
  emoji?: string;
  selected: boolean;
};

const viewSteps: Record<OnboardingView, OnboardingStep | null> = {
  welcome: null,
  folders: "folders",
  storage: "storage",
  provider: "storage",
  config: "storage",
  password: "password",
};

export function getViewStep(view: OnboardingView) {
  return viewSteps[view];
}

export function getPreviousView(
  view: OnboardingView,
  storage: OnboardingStorage,
): OnboardingView | null {
  switch (view) {
    case "welcome":
      return null;
    case "folders":
      return "welcome";
    case "storage":
      return "folders";
    case "provider":
      return "storage";
    case "config":
      return "provider";
    case "password":
      return storage === "CUSTOM" ? "config" : "storage";
  }
}

export function isOnboardingActive(record: OnboardingRecord | undefined) {
  return !!record?.startedAt && !record.completedAt;
}

export function shouldShowOnboarding({
  record,
  hasOnlineAccount,
  hasLocalVaults,
  hasSkippedAuth,
}: {
  record: OnboardingRecord | undefined;
  hasOnlineAccount: boolean;
  hasLocalVaults: boolean;
  hasSkippedAuth: boolean;
}) {
  if (record?.completedAt) return false;
  if (record?.startedAt) return true;

  // Installs that predate onboarding never started it and must not see it.
  return !hasOnlineAccount && !hasLocalVaults && !hasSkippedAuth;
}

const folderPresets: Record<
  SuggestedFolderKind,
  { emoji: string; selected: boolean }
> = {
  documents: { emoji: "📁", selected: true },
  pictures: { emoji: "📸", selected: true },
  desktop: { emoji: "🖥️", selected: true },
  videos: { emoji: "🎬", selected: false },
  music: { emoji: "🎵", selected: false },
  downloads: { emoji: "📥", selected: false },
};

export function getPathName(path: string) {
  const parts = path.split(/[\\/]+/).filter(Boolean);
  return parts.at(-1) || path;
}

export function buildSuggestedFolders(
  suggested: SuggestedFolder[],
): OnboardingFolder[] {
  return suggested.map(({ kind, path }) => ({
    path,
    name: getPathName(path),
    ...folderPresets[kind],
  }));
}

export type FolderSelection = Record<string, boolean | undefined>;

export function resolveFolders(
  suggested: OnboardingFolder[],
  customPaths: string[],
  selection: FolderSelection,
): OnboardingFolder[] {
  const folders = [...suggested];

  for (const path of customPaths) {
    if (folders.some((folder) => folder.path === path)) continue;
    folders.push({ path, name: getPathName(path), selected: true });
  }

  return folders.map((folder) => ({
    ...folder,
    selected: selection[folder.path] ?? folder.selected,
  }));
}

export type FolderSizes = Record<string, number | undefined>;

export function summarizeSelection(
  folders: OnboardingFolder[] | null | undefined,
  sizes: FolderSizes,
) {
  const selected = (folders || []).filter((folder) => folder.selected);

  let bytes = 0;
  let isCalculating = false;

  for (const folder of selected) {
    const size = sizes[folder.path];

    if (size === undefined) isCalculating = true;
    else bytes += size;
  }

  return { count: selected.length, bytes, isCalculating };
}

export type FolderBackupState = "WAITING" | "RUNNING" | "DONE" | "ISSUE";

function getFolderBackupState(source: CoreSourceItem): FolderBackupState {
  if (source.status === "UPLOADING") return "RUNNING";
  if (source.status === "PENDING") return "WAITING";
  if (getBackupIssue(source)) return "ISSUE";
  if (source.lastSnapshot && !source.lastSnapshot.incomplete) return "DONE";

  return "WAITING";
}

function getFolderProgress(source: CoreSourceItem, state: FolderBackupState) {
  if (state === "DONE" || state === "ISSUE") return 1;
  if (state === "WAITING") return 0;

  return Math.max(0, Math.min(1, source.upload?.progress || 0));
}

type BackupPhase = "STARTING" | "RUNNING" | "DONE" | "ISSUE";

export function summarizeBackup(
  sources: CoreSourceItem[] | null | undefined,
  sizes: FolderSizes = {},
) {
  const items = (sources || []).map((source) => {
    const state = getFolderBackupState(source);

    return { source, state, progress: getFolderProgress(source, state) };
  });

  // Weighting by size keeps a tiny folder from reading as a third of the work.
  const hasAllSizes =
    items.length > 0 && items.every(({ source }) => sizes[source.source.path]);

  let totalWeight = 0;
  let completedWeight = 0;
  let protectedBytes = 0;
  let protectedFiles = 0;

  for (const { source, state, progress } of items) {
    const weight = hasAllSizes ? sizes[source.source.path] || 0 : 1;

    totalWeight += weight;
    completedWeight += weight * progress;

    if (state === "RUNNING") {
      protectedBytes +=
        (source.upload?.hashedBytes || 0) + (source.upload?.cachedBytes || 0);
      protectedFiles +=
        (source.upload?.hashedFiles || 0) + (source.upload?.cachedFiles || 0);
    } else if (source.lastSnapshot && !source.lastSnapshot.incomplete) {
      protectedBytes += source.lastSnapshot.stats.totalSize;
      protectedFiles += source.lastSnapshot.stats.fileCount;
    }
  }

  const isSettled =
    items.length > 0 &&
    items.every(({ state }) => state === "DONE" || state === "ISSUE");

  const phase: BackupPhase = isSettled
    ? items.some(({ state }) => state === "ISSUE")
      ? "ISSUE"
      : "DONE"
    : items.some(({ state }) => state === "RUNNING" || state === "DONE")
      ? "RUNNING"
      : "STARTING";

  return {
    phase,
    items,
    progress: totalWeight ? completedWeight / totalWeight : 0,
    protectedBytes,
    protectedFiles,
  };
}

export type FirstBackupStatus = "IDLE" | "PENDING" | "STARTED" | "ERROR";

export type BackupView = BackupPhase | "PAUSED" | "ERROR";

export function getBackupView({
  vaultStatus,
  firstBackupStatus,
  sources,
}: {
  vaultStatus: string | undefined;
  firstBackupStatus: FirstBackupStatus;
  sources: CoreSourceItem[] | null | undefined;
}): BackupView {
  if (
    vaultStatus === "FAILED" ||
    vaultStatus === "SETUP" ||
    firstBackupStatus === "ERROR"
  )
    return "ERROR";

  if (firstBackupStatus === "PENDING" || !sources) return "STARTING";

  const { phase } = summarizeBackup(sources);
  if (phase !== "STARTING") return phase;
  if (firstBackupStatus === "STARTED") return "STARTING";

  // Reopened after the app quit before the backup could get going.
  return sources.length ? "PAUSED" : "ERROR";
}
