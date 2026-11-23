import { setFirstBackup } from "@desktop/hooks/state/use-onboarding";
import type { OnboardingFolder } from "@desktop/lib/onboarding";
import { kopiaParamsFromProfile, profileFromParts } from "@desktop/lib/profile";
import { vaultApi } from "@desktop/lib/vault";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

const VAULT_START_TIMEOUT = 120_000;
const VAULT_POLL_INTERVAL = 500;

async function waitForVault(vaultId: string) {
  const deadline = Date.now() + VAULT_START_TIMEOUT;

  while (Date.now() < deadline) {
    const vault = await window.electron.vault.status(vaultId);

    if (vault?.status === "RUNNING") return;
    if (vault?.status === "FAILED") throw new Error("VAULT_FAILED");

    await new Promise((resolve) => setTimeout(resolve, VAULT_POLL_INTERVAL));
  }

  throw new Error("VAULT_START_TIMEOUT");
}

async function addFolders(vaultId: string, folders: OnboardingFolder[]) {
  const failedPaths: string[] = [];
  let failure: unknown;

  for (const folder of folders) {
    try {
      await vaultApi(vaultId).post("/api/v1/sources", {
        path: folder.path,
        createSnapshot: false,
        policy: {
          name: folder.name,
          emoji: folder.emoji,
          initialSourceType: "directory",
        },
      });
    } catch (error) {
      failure = error;
      failedPaths.push(folder.path);
    }
  }

  // One unreadable folder shouldn't keep the rest from being protected.
  if (failedPaths.length === folders.length) throw failure;

  return failedPaths;
}

export function useFirstBackup() {
  const posthog = usePostHog();

  const startFirstBackup = useCallback(
    async (vaultId: string, folders: OnboardingFolder[]) => {
      const profile = profileFromParts({
        hostName: window.electron.os.hostName(vaultId),
        userName: window.electron.os.userName(vaultId),
      });

      try {
        if (!profile || !folders.length) throw new Error("NOTHING_TO_BACK_UP");

        setFirstBackup({ status: "PENDING", stage: "VAULT" });
        await waitForVault(vaultId);

        setFirstBackup({ status: "PENDING", stage: "FOLDERS" });
        const failedPaths = await addFolders(vaultId, folders);
        await window.electron.store.set("onboarding.failedPaths", failedPaths);

        setFirstBackup({ status: "PENDING", stage: "UPLOAD" });
        await vaultApi(vaultId).post(
          "/api/v1/sources/upload",
          {},
          { params: kopiaParamsFromProfile(profile) },
        );

        posthog.capture("onboarding_backup_start", {
          vaultId,
          folders: folders.length - failedPaths.length,
          failed: failedPaths.length,
        });
        setFirstBackup({ status: "STARTED", stage: "UPLOAD" });
      } catch (error) {
        posthog.capture("onboarding_backup_failed", {
          vaultId,
          reason: error instanceof Error ? error.message : "UNKNOWN",
        });
        setFirstBackup({ status: "ERROR", stage: "VAULT" });
      }
    },
    [posthog],
  );

  return { startFirstBackup };
}
