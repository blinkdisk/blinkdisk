import { PolicyContextProvider } from "@desktop/components/policy/context";
import type { PolicyTarget } from "@desktop/lib/policy-target";
import { policyTargetId } from "@desktop/lib/policy-target";
import { PolicyEditorForm } from "@desktop/routes/$accountId/$vaultId/policies/policy-editor-form";
import { PolicyEditorLoading } from "@desktop/routes/$accountId/$vaultId/policies/policy-editor-loading";

type PolicyEditorProps = {
  target: PolicyTarget;
  onSelectTarget: (target: PolicyTarget) => void;
};

export function PolicyEditor({ target, onSelectTarget }: PolicyEditorProps) {
  return (
    <PolicyContextProvider key={policyTargetId(target)} target={target}>
      {({ policy }) =>
        policy ? (
          <PolicyEditorForm
            target={target}
            policy={policy.defined}
            onSelectTarget={onSelectTarget}
          />
        ) : (
          <PolicyEditorLoading target={target} />
        )
      }
    </PolicyContextProvider>
  );
}
