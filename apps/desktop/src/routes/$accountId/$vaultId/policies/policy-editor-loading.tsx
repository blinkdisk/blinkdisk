import { Skeleton } from "@blinkdisk/ui/skeleton";
import { SettingsCategorySkeleton } from "@desktop/components/policy/category";
import type { PolicyTarget } from "@desktop/lib/policy-target";
import { policyEditorHeaderClassName } from "@desktop/routes/$accountId/$vaultId/policies/constants";

export function PolicyEditorLoading({ target }: { target: PolicyTarget }) {
  return (
    <div className="flex w-full max-w-[40rem] min-w-0 flex-col gap-8">
      <div className={policyEditorHeaderClassName}>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <Skeleton width={80} height="1.25rem" />
          <Skeleton width={88} height="2.25rem" />
        </div>
      </div>
      {target.kind === "SOURCE" || target.kind === "DRAFT_SOURCE" ? (
        <SettingsCategorySkeleton id="general" />
      ) : null}
      <SettingsCategorySkeleton id="schedule" />
      <SettingsCategorySkeleton id="files" />
      <SettingsCategorySkeleton id="compression" />
      <SettingsCategorySkeleton id="retention" />
    </div>
  );
}
