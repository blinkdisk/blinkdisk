import { getEmojiUrl } from "@blinkdisk/components/folder-card";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZPolicyType } from "@blinkdisk/schemas/policy";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { cn } from "@blinkdisk/utils/class";
import { ExceedingAlert } from "@desktop/components/dialogs/create-folder/exceeding-alert";
import { FolderGeneralSettings } from "@desktop/components/folders/general-settings";
import { CompressionSettings } from "@desktop/components/policy/compression";
import { PolicyContextProvider } from "@desktop/components/policy/context";
import { FilesSettings } from "@desktop/components/policy/files";
import { RetentionSettings } from "@desktop/components/policy/retention";
import { ScheduleSettings } from "@desktop/components/policy/schedule";
import {
  SettingsGroup,
  SettingsPanel,
  SettingsRow,
} from "@desktop/components/settings";
import { useDeletePolicy } from "@desktop/hooks/mutations/core/use-delete-policy";
import { usePublishFolderDraftPolicy } from "@desktop/hooks/mutations/core/use-publish-folder-draft-policy";
import { usePolicyTree } from "@desktop/hooks/queries/core/use-policy-tree";
import {
  isPolicyTargetEqual,
  type PolicySearch,
  type PolicyTarget,
  type PolicyTargetKind,
  type PolicyTreeNode,
  policyTargetFromSearch,
  policyTargetId,
  policyTargetParent,
  policyTargetToSearch,
} from "@desktop/lib/policy-target";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronRightIcon,
  FileClockIcon,
  FolderIcon,
  MonitorIcon,
  SendIcon,
  TrashIcon,
  UserIcon,
  VaultIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const ZPolicySearch = z.object({
  kind: z.enum(["GLOBAL", "HOST", "USER", "FOLDER", "DRAFT_FOLDER"]).optional(),
  hostName: z.string().optional(),
  userName: z.string().optional(),
  policyPath: z.string().optional(),
});

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/settings/policies",
)({
  validateSearch: ZPolicySearch,
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const selectedTarget = useMemo(
    () => policyTargetFromSearch(search as PolicySearch),
    [search],
  );

  const selectTarget = (target: PolicyTarget) =>
    navigate({
      search: policyTargetToSearch(target),
    });

  return (
    <div className="flex flex-col gap-8">
      <div className="grid min-h-0 items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <PolicyTreePanel
          selectedTarget={selectedTarget}
          onSelectTarget={selectTarget}
        />
        <PolicyEditor target={selectedTarget} onSelectTarget={selectTarget} />
      </div>
    </div>
  );
}

type PolicyTreePanelProps = {
  selectedTarget: PolicyTarget;
  onSelectTarget: (target: PolicyTarget) => void;
};

function PolicyTreePanel({
  selectedTarget,
  onSelectTarget,
}: PolicyTreePanelProps) {
  const { t } = useAppTranslation("policy.page");
  const { data: tree, isPending } = usePolicyTree();
  const { hostName, userName } = Route.useParams();
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    if (!tree) return;

    setExpandedNodeIds(
      getInitialExpandedPolicyTreeNodeIds({
        tree,
        selectedTarget,
        hostName,
        userName,
      }),
    );
  }, [tree, selectedTarget, hostName, userName]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodeIds((ids) => {
      const next = new Set(ids);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  return (
    <aside className="lg:sticky lg:top-0 lg:self-start">
      <SettingsPanel>
        <div className="border-border border-b px-4 py-3">
          <h2 className="text-sm font-semibold">{t("tree.title")}</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t("tree.description")}
          </p>
        </div>
        <div className="flex w-full flex-col gap-0.5 p-2">
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
      </SettingsPanel>
    </aside>
  );
}

type PolicyTreeItemProps = {
  node: PolicyTreeNode;
  selectedTarget: PolicyTarget;
  expandedNodeIds: Set<string>;
  onToggleNode: (nodeId: string) => void;
  onSelectTarget: (target: PolicyTarget) => void;
};

function PolicyTreeItem({
  node,
  selectedTarget,
  expandedNodeIds,
  onToggleNode,
  onSelectTarget,
}: PolicyTreeItemProps) {
  const { t } = useAppTranslation("policy.page");
  const Icon = getPolicyTargetIcon(node.target.kind);
  const active = isPolicyTargetEqual(node.target, selectedTarget);
  const hasChildren = node.children.length > 0;
  const collapsible = hasChildren && node.target.kind !== "GLOBAL";
  const expanded = expandedNodeIds.has(node.id);
  const emoji = node.source?.emoji;
  const emojiUrl = useMemo(() => {
    if (!emoji) return undefined;
    return getEmojiUrl(emoji);
  }, [emoji]);

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
            <Icon className="size-4 shrink-0" />
          )}
          <span className="min-w-0 flex-1 truncate">{node.label}</span>
          {node.target.kind === "DRAFT_FOLDER" ? (
            <Badge variant="secondary" className="shrink-0">
              {t("draft.badge")}
            </Badge>
          ) : null}
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
    selectedTarget.kind === "FOLDER" || selectedTarget.kind === "DRAFT_FOLDER"
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

function PolicyEditor({
  target,
  onSelectTarget,
}: {
  target: PolicyTarget;
  onSelectTarget: (target: PolicyTarget) => void;
}) {
  return (
    <PolicyContextProvider key={policyTargetId(target)} target={target}>
      {({ policy }) => (
        <div className="flex min-w-0 flex-col gap-8">
          {target.kind === "DRAFT_FOLDER" ? (
            <DraftPolicyActions
              target={target}
              policy={policy?.defined}
              onSelectTarget={onSelectTarget}
            />
          ) : null}
          {target.kind === "FOLDER" || target.kind === "DRAFT_FOLDER" ? (
            <FolderGeneralSettings />
          ) : null}
          <ScheduleSettings />
          <FilesSettings />
          <CompressionSettings />
          <RetentionSettings />
        </div>
      )}
    </PolicyContextProvider>
  );
}

function DraftPolicyActions({
  target,
  policy,
  onSelectTarget,
}: {
  target: Extract<PolicyTarget, { kind: "DRAFT_FOLDER" }>;
  policy?: ZPolicyType;
  onSelectTarget: (target: PolicyTarget) => void;
}) {
  const { t } = useAppTranslation("policy.page");
  const [alertShown, setAlertShown] = useState(false);

  const publish = usePublishFolderDraftPolicy({
    target,
    onError: (error) => {
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        error.message === "FOLDER_TOO_LARGE"
      )
        setAlertShown(true);
    },
  });

  const discard = useDeletePolicy({
    target,
    onSuccess: () => {
      const parent = policyTargetParent(target);
      if (parent) onSelectTarget(parent);
    },
  });

  return (
    <SettingsGroup title={t("draft.title")}>
      <SettingsPanel>
        <SettingsRow
          title={t("draft.publish.title")}
          description={t("draft.publish.description")}
        >
          <Button
            size="sm"
            onClick={() => policy && publish.mutate({ policy })}
            disabled={!policy}
            loading={publish.isPending}
          >
            <SendIcon />
            {t("draft.publish.button")}
          </Button>
        </SettingsRow>
        <SettingsRow
          title={t("draft.discard.title")}
          description={t("draft.discard.description")}
        >
          <Button
            size="sm"
            variant="destructive-secondary"
            onClick={() => discard.mutate()}
            loading={discard.isPending}
          >
            <TrashIcon />
            {t("draft.discard.button")}
          </Button>
        </SettingsRow>
      </SettingsPanel>
      {policy ? (
        <ExceedingAlert
          open={alertShown}
          setOpen={setAlertShown}
          loading={publish.isPending}
          submit={() => publish.mutate({ policy, force: true })}
        />
      ) : null}
    </SettingsGroup>
  );
}

function getPolicyTargetIcon(kind: PolicyTargetKind) {
  switch (kind) {
    case "GLOBAL":
      return VaultIcon;
    case "HOST":
      return MonitorIcon;
    case "USER":
      return UserIcon;
    case "FOLDER":
      return FolderIcon;
    case "DRAFT_FOLDER":
      return FileClockIcon;
  }
}
