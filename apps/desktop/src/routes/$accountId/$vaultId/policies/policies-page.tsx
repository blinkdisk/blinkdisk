import type { PolicyTarget } from "@desktop/lib/policy-target";
import { PolicyEditor } from "@desktop/routes/$accountId/$vaultId/policies/policy-editor";
import { PolicyTreePanel } from "@desktop/routes/$accountId/$vaultId/policies/policy-tree-panel";

type PoliciesPageProps = {
  selectedTarget: PolicyTarget;
  onSelectTarget: (target: PolicyTarget) => void;
};

export function PoliciesPage({
  selectedTarget,
  onSelectTarget,
}: PoliciesPageProps) {
  return (
    <div className="flex min-h-full flex-col overflow-y-auto px-6 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-10">
        <div className="flex flex-col gap-8">
          <div className="grid min-h-0 justify-center gap-y-8 gap-x-6 lg:grid-cols-[18rem_minmax(0,40rem)] xl:gap-x-12 2xl:gap-x-16">
            <PolicyTreePanel
              selectedTarget={selectedTarget}
              onSelectTarget={onSelectTarget}
            />
            <PolicyEditor
              target={selectedTarget}
              onSelectTarget={onSelectTarget}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
