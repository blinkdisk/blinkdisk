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
  policyTargetLabel,
  policyTargetParent,
  policyTargetToSearch,
} from "@desktop/lib/policy-target";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileClockIcon,
  FolderIcon,
  Globe2Icon,
  LaptopIcon,
  SendIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

const ZPolicySearch = z.object({
  kind: z.enum(["GLOBAL", "HOST", "USER", "FOLDER", "DRAFT_FOLDER"]).optional(),
  hostName: z.string().optional(),
  userName: z.string().optional(),
  policyPath: z.string().optional(),
});

type PolicyPageTranslate = ReturnType<typeof useAppTranslation>["t"];

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
    <div className="grid min-h-0 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <PolicyTreePanel
        selectedTarget={selectedTarget}
        onSelectTarget={selectTarget}
      />
      <PolicyEditor target={selectedTarget} onSelectTarget={selectTarget} />
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

  return (
    <aside className="lg:sticky lg:top-8 lg:self-start">
      <SettingsPanel>
        <SettingsRow fullWidth>
          <div>
            <h2 className="font-semibold">{t("tree.title")}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("tree.description")}
            </p>
          </div>
        </SettingsRow>
        <SettingsRow fullWidth>
          <div className="flex w-full flex-col gap-1">
            {isPending || !tree ? (
              <Skeleton count={8} height="2rem" />
            ) : (
              <PolicyTreeItem
                node={tree}
                depth={0}
                selectedTarget={selectedTarget}
                onSelectTarget={onSelectTarget}
              />
            )}
          </div>
        </SettingsRow>
      </SettingsPanel>
    </aside>
  );
}

type PolicyTreeItemProps = {
  node: PolicyTreeNode;
  depth: number;
  selectedTarget: PolicyTarget;
  onSelectTarget: (target: PolicyTarget) => void;
};

function PolicyTreeItem({
  node,
  depth,
  selectedTarget,
  onSelectTarget,
}: PolicyTreeItemProps) {
  const { t } = useAppTranslation("policy.page");
  const Icon = getPolicyTargetIcon(node.target.kind);
  const active = isPolicyTargetEqual(node.target, selectedTarget);

  return (
    <>
      <button
        type="button"
        onClick={() => onSelectTarget(node.target)}
        className={cn(
          "flex h-9 w-full min-w-0 items-center gap-2 rounded-md px-2 text-left text-sm transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
        )}
        style={{ paddingLeft: `${0.5 + depth * 0.9}rem` }}
      >
        <Icon className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{node.label}</span>
        {node.target.kind === "DRAFT_FOLDER" ? (
          <Badge variant="secondary" className="shrink-0">
            {t("draft.badge")}
          </Badge>
        ) : null}
      </button>
      {node.children.map((child) => (
        <PolicyTreeItem
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedTarget={selectedTarget}
          onSelectTarget={onSelectTarget}
        />
      ))}
    </>
  );
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
          <SelectedPolicyHeader target={target} />
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
          <RetentionSettings />
          <FilesSettings />
          <CompressionSettings />
        </div>
      )}
    </PolicyContextProvider>
  );
}

function SelectedPolicyHeader({ target }: { target: PolicyTarget }) {
  const { t } = useAppTranslation("policy.page");

  return (
    <SettingsGroup title={policyTargetLabel(target)}>
      <SettingsPanel>
        <SettingsRow fullWidth>
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
              {(() => {
                const Icon = getPolicyTargetIcon(target.kind);
                return <Icon className="size-5" />;
              })()}
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate font-medium">
                  {getPolicyTargetDescription(target, t)}
                </p>
                {target.kind === "DRAFT_FOLDER" ? (
                  <Badge variant="secondary">{t("draft.badge")}</Badge>
                ) : null}
              </div>
              <p className="text-muted-foreground mt-1 truncate text-sm">
                {getPolicyTargetPath(target, t)}
              </p>
            </div>
          </div>
        </SettingsRow>
      </SettingsPanel>
    </SettingsGroup>
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
      return Globe2Icon;
    case "HOST":
      return LaptopIcon;
    case "USER":
      return UserIcon;
    case "FOLDER":
      return FolderIcon;
    case "DRAFT_FOLDER":
      return FileClockIcon;
  }
}

function getPolicyTargetDescription(
  target: PolicyTarget,
  t: PolicyPageTranslate,
) {
  switch (target.kind) {
    case "GLOBAL":
      return t("target.global.description");
    case "HOST":
      return t("target.host.description", { hostName: target.hostName });
    case "USER":
      return t("target.user.description", { userName: target.userName });
    case "FOLDER":
      return t("target.folder.description");
    case "DRAFT_FOLDER":
      return t("target.draft.description");
  }
}

function getPolicyTargetPath(target: PolicyTarget, t: PolicyPageTranslate) {
  switch (target.kind) {
    case "GLOBAL":
      return t("target.global.path");
    case "HOST":
      return `@${target.hostName}`;
    case "USER":
      return `${target.userName}@${target.hostName}`;
    case "FOLDER":
    case "DRAFT_FOLDER":
      return `${target.userName}@${target.hostName}:${target.path}`;
  }
}
