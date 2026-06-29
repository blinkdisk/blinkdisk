import { getEmojiUrl } from "@blinkdisk/components/folder-card";
import { useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZPolicyType } from "@blinkdisk/schemas/policy";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@blinkdisk/ui/tabs";
import { cn } from "@blinkdisk/utils/class";
import { ExceedingAlert } from "@desktop/components/dialogs/create-source/exceeding-alert";
import { SourceGeneralSettings } from "@desktop/components/sources/general-settings";
import { SettingsCategorySkeleton } from "@desktop/components/policy/category";
import { CompressionSettings } from "@desktop/components/policy/compression";
import { PolicyContextProvider } from "@desktop/components/policy/context";
import { FilesSettings } from "@desktop/components/policy/files";
import { RetentionSettings } from "@desktop/components/policy/retention";
import { ScheduleSettings } from "@desktop/components/policy/schedule";
import {
  getPolicyFromFormValues,
  type PolicyForm,
  usePolicyForm,
} from "@desktop/hooks/forms/use-policy-form";
import { useActivateSourceDraftPolicy } from "@desktop/hooks/mutations/core/use-activate-source-draft-policy";
import { useDeletePolicy } from "@desktop/hooks/mutations/core/use-delete-policy";
import { usePolicyTree } from "@desktop/hooks/queries/core/use-policy-tree";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
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
  ListChecksIcon,
  MonitorIcon,
  PlusIcon,
  SaveIcon,
  SlidersHorizontalIcon,
  TrashIcon,
  UserIcon,
  VaultIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

type PolicyEditorMode = "basic" | "advanced";

const ZPolicySearch = z.object({
  kind: z.enum(["GLOBAL", "HOST", "USER", "SOURCE", "DRAFT_SOURCE"]).optional(),
  hostName: z.string().optional(),
  userName: z.string().optional(),
  policyPath: z.string().optional(),
});

export const Route = createFileRoute("/$accountId/$vaultId/policies")({
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
    <div className="flex min-h-full flex-col overflow-y-auto px-6 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-10">
        <div className="flex flex-col gap-8">
          <div className="grid min-h-0 justify-center gap-y-8 gap-x-6 lg:grid-cols-[18rem_minmax(0,40rem)] xl:gap-x-12 2xl:gap-x-16">
            <PolicyTreePanel
              selectedTarget={selectedTarget}
              onSelectTarget={selectTarget}
            />
            <PolicyEditor
              target={selectedTarget}
              onSelectTarget={selectTarget}
            />
          </div>
        </div>
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
  const { localHostName, localUserName } = useLocalProfile();
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    if (!tree) return;

    setExpandedNodeIds(
      getInitialExpandedPolicyTreeNodeIds({
        tree,
        selectedTarget,
        hostName: localHostName || undefined,
        userName: localUserName || undefined,
      }),
    );
  }, [tree, selectedTarget, localHostName, localUserName]);

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
  const [storedMode, setMode] = useAppStorage("preferences.mode", "basic");
  const mode = storedMode ?? "basic";
  const showAdvanced = mode === "advanced";
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
      <FilesSettings form={form} showAdvanced={showAdvanced} />
      {showAdvanced ? (
        <>
          <CompressionSettings form={form} />
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

function PolicyAdvancedModeBanner({
  onSwitchToAdvanced,
}: {
  onSwitchToAdvanced: () => void;
}) {
  const { t } = useAppTranslation("policy.page");

  return (
    <aside className="border-border bg-card flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-base font-semibold">
          {t("editor.advancedBanner.title")}
        </h2>
        <p className="text-muted-foreground mt-1 max-w-lg text-sm">
          {t("editor.advancedBanner.description")}
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full sm:w-auto"
        onClick={onSwitchToAdvanced}
      >
        <SlidersHorizontalIcon />
        {t("editor.advancedBanner.button")}
      </Button>
    </aside>
  );
}

function PolicyEditorHeader({
  draftPolicy,
  draftTarget,
  form,
  mode,
  onModeChange,
  onSelectTarget,
}: {
  draftPolicy?: ZPolicyType;
  draftTarget?: Extract<PolicyTarget, { kind: "DRAFT_SOURCE" }>;
  form: PolicyForm;
  mode: PolicyEditorMode;
  onModeChange: (mode: PolicyEditorMode) => void;
  onSelectTarget: (target: PolicyTarget) => void;
}) {
  const { t } = useAppTranslation("policy.page");
  const [alertShown, setAlertShown] = useState(false);
  const isDirty = useStore(form.store, (state) => state.isDirty);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const activate = useActivateSourceDraftPolicy({
    target: draftTarget,
    onError: (error) => {
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        error.message === "SOURCE_TOO_LARGE"
      )
        setAlertShown(true);
    },
  });
  const discard = useDeletePolicy({
    target: draftTarget,
    onSuccess: () => {
      if (!draftTarget) return;

      const parent = policyTargetParent(draftTarget);
      if (parent) onSelectTarget(parent);
    },
  });

  return (
    <>
      <div className={policyEditorHeaderClassName}>
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <h1 className="shrink-0 text-2xl font-bold">{t("editor.title")}</h1>
          <div className="flex min-w-fit flex-1 justify-center">
            <Tabs
              value={mode}
              onValueChange={(value) => onModeChange(value as PolicyEditorMode)}
              className="shrink-0"
            >
              <TabsList className="h-10">
                <TabsTrigger value="basic" className="px-4">
                  <ListChecksIcon />
                  {t("editor.mode.basic")}
                </TabsTrigger>
                <TabsTrigger value="advanced" className="px-4">
                  <SlidersHorizontalIcon />
                  {t("editor.mode.advanced")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {draftTarget ? (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="destructive-secondary"
                aria-label={t("draft.discard.button")}
                title={t("draft.discard.button")}
                onClick={() => discard.mutate()}
                loading={discard.isPending}
              >
                <TrashIcon />
              </Button>
              <Button
                type="submit"
                size="icon"
                variant="secondary"
                aria-label={t("editor.save")}
                title={t("editor.save")}
                disabled={!isDirty || isSubmitting}
                loading={isSubmitting}
              >
                <SaveIcon />
              </Button>
              <Button
                type="button"
                onClick={() =>
                  draftPolicy && activate.mutate({ policy: draftPolicy })
                }
                disabled={!draftPolicy}
                loading={activate.isPending}
              >
                <PlusIcon />
                {t("draft.activate.button")}
              </Button>
            </div>
          ) : (
            <Button
              type="submit"
              disabled={!isDirty || isSubmitting}
              loading={isSubmitting}
            >
              <SaveIcon />
              {t("editor.save")}
            </Button>
          )}
        </div>
      </div>
      {draftPolicy ? (
        <ExceedingAlert
          open={alertShown}
          setOpen={setAlertShown}
          loading={activate.isPending}
          submit={() => activate.mutate({ policy: draftPolicy, force: true })}
        />
      ) : null}
    </>
  );
}

function PolicyEditorLoading({ target }: { target: PolicyTarget }) {
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

const policyEditorHeaderClassName =
  "before:content-[''] after:content-[''] before:bg-background bg-background after:bg-border/70 sticky top-0 z-50 -mx-1 -mt-2 px-1 py-3 before:absolute before:inset-x-0 before:-top-8 before:h-8 after:absolute after:inset-x-0 after:bottom-0 after:h-px";

function getPolicyTargetIcon(kind: PolicyTargetKind) {
  switch (kind) {
    case "GLOBAL":
      return VaultIcon;
    case "HOST":
      return MonitorIcon;
    case "USER":
      return UserIcon;
    case "SOURCE":
    case "DRAFT_SOURCE":
      return FolderIcon;
  }
}
