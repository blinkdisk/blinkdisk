import { getEmojiUrl } from "@blinkdisk/components/emoji";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Badge } from "@blinkdisk/ui/badge";
import { cn } from "@blinkdisk/utils/class";
import {
  isPolicyTargetEqual,
  type PolicyTarget,
  type PolicyTreeNode,
} from "@desktop/lib/policy-target";
import { PolicyTreeItemIcon } from "@desktop/routes/$accountId/$vaultId/policies/policy-tree-item-icon";
import { ChevronRightIcon } from "lucide-react";

type PolicyTreeItemProps = {
  node: PolicyTreeNode;
  selectedTarget: PolicyTarget;
  expandedNodeIds: Set<string>;
  onToggleNode: (nodeId: string) => void;
  onSelectTarget: (target: PolicyTarget) => void;
};

export function PolicyTreeItem({
  node,
  selectedTarget,
  expandedNodeIds,
  onToggleNode,
  onSelectTarget,
}: PolicyTreeItemProps) {
  const { t } = useAppTranslation("policy.page");
  const active = isPolicyTargetEqual(node.target, selectedTarget);
  const hasChildren = node.children.length > 0;
  const collapsible = hasChildren && node.target.kind !== "GLOBAL";
  const expanded = expandedNodeIds.has(node.id);
  const emoji = node.source?.emoji;
  const emojiUrl = (() => {
    if (!emoji) return undefined;
    return getEmojiUrl(emoji);
  })();

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div
        className={cn(
          "flex h-9 w-full min-w-0 items-center rounded-md text-sm transition-colors",
          active
            ? "bg-foreground/6 text-foreground font-medium"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
        )}
      >
        <button
          type="button"
          onClick={() => onSelectTarget(node.target)}
          className="flex h-full min-w-0 flex-1 items-center gap-2 pl-2 text-left"
        >
          {emojiUrl ? (
            <img src={emojiUrl} alt={emoji} className="size-4 shrink-0" />
          ) : (
            <PolicyTreeItemIcon node={node} />
          )}
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="min-w-0 truncate">{node.label}</span>
            {node.target.kind === "DRAFT_SOURCE" ? (
              <Badge variant="subtle" className="shrink-0">
                {t("draft.badge")}
              </Badge>
            ) : null}
          </span>
        </button>
        {collapsible ? (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => onToggleNode(node.id)}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-current opacity-75 transition-opacity hover:opacity-100"
          >
            <ChevronRightIcon
              className={cn(
                "size-4 transition-transform",
                expanded && "rotate-90",
              )}
            />
          </button>
        ) : null}
      </div>
      {hasChildren && (expanded || !collapsible) ? (
        <div className="border-border/70 ml-[1.05rem] flex flex-col gap-0.5 border-l pl-2">
          {node.children.map((child) => (
            <PolicyTreeItem
              key={child.id}
              node={child}
              selectedTarget={selectedTarget}
              expandedNodeIds={expandedNodeIds}
              onToggleNode={onToggleNode}
              onSelectTarget={onSelectTarget}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
