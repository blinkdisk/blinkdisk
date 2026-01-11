import { useVaultList } from "@desktop/hooks/queries/use-vault-list";
import { CorePolicy } from "@desktop/lib/policy";
import { trpc } from "@desktop/lib/trpc";
import { vaultApi } from "@desktop/lib/vault";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

declare global {
  interface Window {
    migratedProfiles: boolean;
  }
}

export function useMigrationListener() {
  const navigate = useNavigate();

  const { data: vaults } = useVaultList();

  const migrateProfiles = useCallback(async () => {
    if (!vaults) return;

    // Already migrated, skip
    if (window.migratedProfiles) return;
    // eslint-disable-next-line
    window.migratedProfiles = true;

    const legacyProfiles = await trpc.profile.listLegacy.query();
    const legacyVaults = vaults.filter((vault) => vault.version === 1);

    await navigate({ to: "/app/migrate" });

    console.info("Migrating legacy profiles:", legacyProfiles);
    console.info("Migrating vaults:", legacyVaults);

    while (true) {
      let starting = false;

      for (const vault of legacyVaults) {
        const status = await window.electron!.vault.status({
          vaultId: vault.id,
        });

        if (status === "STARTING") starting = true;
      }

      if (!starting) break;

      console.info("Waiting for all vaults to be started");
      await new Promise((res) => setTimeout(res, 1000));
    }

    for (const vault of legacyVaults) {
      const logPrefix = `[${vault.id}]`;

      const status = await window.electron!.vault.status({
        vaultId: vault.id,
      });

      if (status !== "RUNNING") {
        console.info(logPrefix, "Vault", vault.id, "is", status, ", skipping");
        continue;
      }

      console.info(logPrefix, "Checking vault");

      const res = await vaultApi(vault.id).get<{
        policies: {
          target: {
            host: string;
            userName: string;
            path: string;
          };
          policy: CorePolicy;
        }[];
      }>("/api/v1/policies");

      const movedProfiles: string[] = [];

      for (const policy of res.data.policies) {
        if (!policy.target.host || !policy.target.userName) continue;

        const legacyProfile = legacyProfiles.find(
          (profile) => policy.target.host === profile.id,
        );

        if (!legacyProfile) {
          console.info(
            logPrefix,
            "Host",
            policy.target.host,
            "is not legacy , skipping",
          );
          continue;
        }

        const legacyUser = legacyProfile.userNames.find(
          (userName) => policy.target.userName === userName.id,
        );

        if (!legacyUser) {
          console.info(
            logPrefix,
            "User",
            policy.target.userName,
            "is not legacy , skipping",
          );
          continue;
        }

        const source = `${policy.target.userName}@${policy.target.host}${policy.target.path ? `:${policy.target.path}` : ""}`;
        const destination = `${legacyUser.userName}@${legacyProfile.hostName}${policy.target.path ? `:${policy.target.path}` : ""}`;

        const sourceProfile = `${policy.target.userName}@${policy.target.host}`;
        const destinationProfile = `${legacyUser.userName}@${legacyProfile.hostName}`;

        if (!movedProfiles.includes(sourceProfile)) {
          try {
            console.info(
              logPrefix,
              "Moving snapshots from",
              sourceProfile,
              "to",
              destinationProfile,
            );

            await vaultApi(vault.id).post("/api/v1/snapshots/move", {
              source: sourceProfile,
              destination: destinationProfile,
            });
          } catch (e) {
            console.error(logPrefix, "Failed to move snapshots", e);
            continue;
          }

          movedProfiles.push(sourceProfile);
        }

        console.info(logPrefix, "Moving policy", source, "to", destination);

        try {
          await vaultApi(vault.id).put("/api/v1/policy", policy.policy, {
            params: {
              host: legacyProfile.hostName,
              userName: legacyUser.userName,
              ...(policy.target.path ? { path: policy.target.path } : {}),
            },
          });

          await vaultApi(vault.id).delete("/api/v1/policy", {
            params: {
              host: policy.target.host,
              userName: policy.target.userName,
              ...(policy.target.path ? { path: policy.target.path } : {}),
            },
          });
        } catch (e) {
          console.error(logPrefix, "Failed to move policy", e);
        }
      }

      console.info(logPrefix, "Updating vault version to 2");
      try {
        await trpc.vault.update.mutate({
          vaultId: vault.id,
          version: 2,
        });
      } catch (e) {
        console.error(logPrefix, "Failed to update vault version", e);
      }
    }

    await navigate({ to: "/app" });
  }, [vaults, navigate]);

  useEffect(() => {
    if (!vaults || !vaults.length) return;

    const hasLegacyVaults = vaults.some((vault) => vault.version === 1);
    if (hasLegacyVaults) migrateProfiles();
  }, [migrateProfiles, vaults]);

  return null;
}
