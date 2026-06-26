import { getEmojiUrl } from "@blinkdisk/components/folder-card";
import { useStore } from "@blinkdisk/forms/use-app-form";
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
import { SettingsPanel, SettingsRow } from "@desktop/components/settings";
import {
  getPolicyFromFormValues,
  type PolicyForm,
  usePolicyForm,
} from "@desktop/hooks/forms/use-policy-form";
import { useActivateFolderDraftPolicy } from "@desktop/hooks/mutations/core/use-activate-folder-draft-policy";
import { useDeletePolicy } from "@desktop/hooks/mutations/core/use-delete-policy";
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
  FolderIcon,
  MonitorIcon,
  SaveIcon,
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
      <div className="grid min-h-0 justify-center gap-6 lg:grid-cols-[18rem_minmax(0,40rem)]">
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
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="min-w-0 truncate">{node.label}</span>
            {node.target.kind === "DRAFT_FOLDER" ? (
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

function PolicyEditorForm({
  target,
  policy,
  onSelectTarget,
}: {
  target: PolicyTarget;
  policy: ZPolicyType;
  onSelectTarget: (target: PolicyTarget) => void;
}) {
  const form = usePolicyForm();
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
      <PolicyEditorHeader form={form} />
      {target.kind === "DRAFT_FOLDER" ? (
        <DraftPolicyActions
          target={target}
          policy={currentPolicy}
          onSelectTarget={onSelectTarget}
        />
      ) : null}
      {target.kind === "FOLDER" || target.kind === "DRAFT_FOLDER" ? (
        <FolderGeneralSettings form={form} />
      ) : null}
      <ScheduleSettings form={form} />
      <FilesSettings form={form} />
      <CompressionSettings form={form} />
      <RetentionSettings form={form} />
    </form>
  );
}

function PolicyEditorHeader({ form }: { form: PolicyForm }) {
  const { t } = useAppTranslation("policy.page");
  const isDirty = useStore(form.store, (state) => state.isDirty);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <div className="bg-background/95 sticky top-0 z-10 -mx-1 flex items-center justify-between gap-4 px-1 py-2 backdrop-blur">
      <h1 className="text-xl font-semibold">{t("editor.title")}</h1>
      <Button
        type="submit"
        size="sm"
        disabled={!isDirty || isSubmitting}
        loading={isSubmitting}
      >
        <SaveIcon />
        {t("editor.save")}
      </Button>
    </div>
  );
}

function PolicyEditorLoading({ target }: { target: PolicyTarget }) {
  return (
    <div className="flex w-full max-w-[40rem] min-w-0 flex-col gap-8">
      <div className="bg-background/95 sticky top-0 z-10 -mx-1 flex items-center justify-between gap-4 px-1 py-2 backdrop-blur">
        <Skeleton width={80} height="1.25rem" />
        <Skeleton width={88} height="2.25rem" />
      </div>
      {target.kind === "FOLDER" || target.kind === "DRAFT_FOLDER" ? (
        <SettingsCategorySkeleton id="general" />
      ) : null}
      <SettingsCategorySkeleton id="schedule" />
      <SettingsCategorySkeleton id="files" />
      <SettingsCategorySkeleton id="compression" />
      <SettingsCategorySkeleton id="retention" />
    </div>
  );
}

function SettingsCategorySkeleton({ id }: { id: string }) {
  return (
    <section id={id} className="grid scroll-mt-8 gap-4">
      <div className="grid gap-1">
        <Skeleton width={150} height="1.25rem" />
        <Skeleton width={260} />
      </div>
      <SettingsPanel>
        <SettingsRow fullWidth className="px-7 py-6">
          <Skeleton count={4} height="2.75rem" />
        </SettingsRow>
      </SettingsPanel>
    </section>
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

  const activate = useActivateFolderDraftPolicy({
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
    <>
      <SettingsPanel>
        <SettingsRow
          className="px-7 py-6"
          title={t("draft.notice.title")}
          description={t("draft.notice.description")}
        >
          <div className="flex flex-wrap justify-start gap-2 md:justify-end">
            <Button
              type="button"
              size="sm"
              variant="destructive-secondary"
              onClick={() => discard.mutate()}
              loading={discard.isPending}
            >
              <TrashIcon />
              {t("draft.discard.button")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => policy && activate.mutate({ policy })}
              disabled={!policy}
              loading={activate.isPending}
            >
              <SendIcon />
              {t("draft.activate.button")}
            </Button>
          </div>
        </SettingsRow>
      </SettingsPanel>
      {policy ? (
        <ExceedingAlert
          open={alertShown}
          setOpen={setAlertShown}
          loading={activate.isPending}
          submit={() => activate.mutate({ policy, force: true })}
        />
      ) : null}
    </>
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
    case "DRAFT_FOLDER":
      return FolderIcon;
  }
}
