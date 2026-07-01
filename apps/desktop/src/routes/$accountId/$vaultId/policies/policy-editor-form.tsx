import { useStore } from "@blinkdisk/forms/use-app-form";
import type { ZPolicyType } from "@blinkdisk/schemas/policy";
import { isFileLikeSource } from "@blinkdisk/schemas/source";
import { CompressionSettings } from "@desktop/components/policy/compression";
import { FilesSettings } from "@desktop/components/policy/files";
import { RetentionSettings } from "@desktop/components/policy/retention";
import { ScheduleSettings } from "@desktop/components/policy/schedule";
import { SourceGeneralSettings } from "@desktop/components/sources/general-settings";
import {
  getPolicyFromFormValues,
  usePolicyForm,
} from "@desktop/hooks/forms/use-policy-form";
import { useSourceList } from "@desktop/hooks/queries/core/use-source-list";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import type { PolicyTarget } from "@desktop/lib/policy-target";
import { PolicyAdvancedModeBanner } from "@desktop/routes/$accountId/$vaultId/policies/policy-advanced-mode-banner";
import { PolicyEditorHeader } from "@desktop/routes/$accountId/$vaultId/policies/policy-editor-header";
import { getPolicyTargetSource } from "@desktop/routes/$accountId/$vaultId/policies/policy-target-source";

type PolicyEditorFormProps = {
  target: PolicyTarget;
  policy: ZPolicyType;
  onSelectTarget: (target: PolicyTarget) => void;
};

export function PolicyEditorForm({
  target,
  policy,
  onSelectTarget,
}: PolicyEditorFormProps) {
  const form = usePolicyForm();
  const [storedMode, setMode] = useAppStorage("preferences.mode", "basic");
  const mode = storedMode ?? "basic";
  const showAdvanced = mode === "advanced";
  const { data: sources } = useSourceList({
    unfiltered: true,
    includeDrafts: true,
  });
  const policySourceType =
    getPolicyTargetSource(target, sources)?.type || policy.initialSourceType;
  const isFileLikePolicy = isFileLikeSource(policySourceType);
  const currentPolicy = useStore(form.store, (state) =>
    getPolicyFromFormValues(state.values, policy, target.kind !== "GLOBAL"),
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
      className="flex w-full max-w-[40rem] min-w-0 flex-col gap-8"
    >
      <PolicyEditorHeader
        draftPolicy={target.kind === "DRAFT_SOURCE" ? currentPolicy : undefined}
        draftTarget={target.kind === "DRAFT_SOURCE" ? target : undefined}
        form={form}
        mode={mode}
        onModeChange={setMode}
        onSelectTarget={onSelectTarget}
      />
      {target.kind === "SOURCE" || target.kind === "DRAFT_SOURCE" ? (
        <SourceGeneralSettings form={form} />
      ) : null}
      <ScheduleSettings form={form} showAdvanced={showAdvanced} />
      {isFileLikePolicy ? null : (
        <FilesSettings form={form} showAdvanced={showAdvanced} />
      )}
      {showAdvanced ? (
        <>
          <CompressionSettings
            form={form}
            showExtensionFilters={!isFileLikePolicy}
          />
          <RetentionSettings form={form} />
        </>
      ) : (
        <PolicyAdvancedModeBanner
          onSwitchToAdvanced={() => setMode("advanced")}
        />
      )}
    </form>
  );
}
