import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { usePolicyTree } from "@desktop/hooks/queries/core/use-policy-tree";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import {
  isPolicyTargetEqual,
  type PolicyTarget,
  type PolicyTreeNode,
  policyTargetId,
} from "@desktop/lib/policy-target";
import { PolicyTreeItem } from "@desktop/routes/$accountId/$vaultId/policies/policy-tree-item";
import { useState } from "react";

type PolicyTreePanelProps = {
  selectedTarget: PolicyTarget;
  onSelectTarget: (target: PolicyTarget) => void;
};

const EMPTY_EXPANDED_NODE_IDS = new Set<string>();

type PolicyTreeExpansionState = {
  key: string;
  toggledNodeIds: Set<string>;
};

export function PolicyTreePanel({
  selectedTarget,
  onSelectTarget,
}: PolicyTreePanelProps) {
  const { t } = useAppTranslation("policy.page");
  const { data: tree, isPending } = usePolicyTree();
  const { localHostName, localUserName } = useLocalProfile();
  const [expansionState, setExpansionState] =
    useState<PolicyTreeExpansionState | null>(null);
  const expansionKey = `${tree?.id ?? ""}:${policyTargetId(selectedTarget)}:${localHostName ?? ""}:${localUserName ?? ""}`;
  const defaultExpandedNodeIds = tree
    ? getInitialExpandedPolicyTreeNodeIds({
        tree,
        selectedTarget,
        hostName: localHostName || undefined,
        userName: localUserName || undefined,
      })
    : EMPTY_EXPANDED_NODE_IDS;
  const toggledNodeIds =
    expansionState?.key === expansionKey
      ? expansionState.toggledNodeIds
      : EMPTY_EXPANDED_NODE_IDS;
  const expandedNodeIds = (() => {
    const next = new Set(defaultExpandedNodeIds);
    for (const nodeId of toggledNodeIds) {
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
    }
    return next;
  })();

  const toggleNode = (nodeId: string) => {
    setExpansionState((current) => {
      const next =
        current?.key === expansionKey
          ? new Set(current.toggledNodeIds)
          : new Set<string>();

      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      return {
        key: expansionKey,
        toggledNodeIds: next,
      };
    });
  };

  return (
    <aside className="lg:sticky lg:top-0 lg:self-start">
      <section className="grid gap-3">
        <div className="px-2">
          <h2 className="text-xl font-semibold">{t("tree.title")}</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t("tree.description")}
          </p>
        </div>
        <div className="flex w-full flex-col gap-0.5">
          {isPending || !tree ? (
            <Skeleton count={8} height="2.25rem" />
          ) : (
            <PolicyTreeItem
              node={tree}
              selectedTarget={selectedTarget}
              expandedNodeIds={expandedNodeIds}
              onToggleNode={toggleNode}
              onSelectTarget={onSelectTarget}
            />
          )}
        </div>
      </section>
    </aside>
  );
}

function getInitialExpandedPolicyTreeNodeIds({
  tree,
  selectedTarget,
  hostName,
  userName,
}: {
  tree: PolicyTreeNode;
  selectedTarget: PolicyTarget;
  hostName?: string;
  userName?: string;
}) {
  if (selectedTarget.kind === "GLOBAL") {
    return new Set(
      [
        tree.id,
        hostName
          ? policyTargetId({
              kind: "HOST",
              hostName,
            })
          : undefined,
        hostName && userName
          ? policyTargetId({
              kind: "USER",
              hostName,
              userName,
            })
          : undefined,
      ].filter(
        (id): id is string => !!id && !!findPolicyTreeNodeById(tree, id),
      ),
    );
  }

  const path = findPolicyTreeTargetPath(tree, selectedTarget);
  const expandedPath =
    selectedTarget.kind === "SOURCE" || selectedTarget.kind === "DRAFT_SOURCE"
      ? path.slice(0, -1)
      : path;

  return new Set(expandedPath.map((node) => node.id));
}

function findPolicyTreeTargetPath(
  node: PolicyTreeNode,
  target: PolicyTarget,
): PolicyTreeNode[] {
  if (isPolicyTargetEqual(node.target, target)) {
    return [node];
  }

  for (const child of node.children) {
    const path = findPolicyTreeTargetPath(child, target);
    if (path.length > 0) {
      return [node, ...path];
    }
  }

  return [];
}

function findPolicyTreeNodeById(
  node: PolicyTreeNode,
  nodeId: string,
): PolicyTreeNode | undefined {
  if (node.id === nodeId) return node;

  for (const child of node.children) {
    const match = findPolicyTreeNodeById(child, nodeId);
    if (match) return match;
  }

  return undefined;
}
