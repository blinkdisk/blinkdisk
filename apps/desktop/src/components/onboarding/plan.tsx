import { SourceCard } from "@blinkdisk/components/source-card";
import { resolveStorageProviderType } from "@blinkdisk/constants/providers";
import { TRIAL_DAYS, TRIAL_STORAGE } from "@blinkdisk/constants/space";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { cn } from "@blinkdisk/utils/class";
import { providerIcons } from "@desktop/components/icons/providers/index";
import { useOnboardingFolders } from "@desktop/hooks/queries/use-onboarding-folders";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useOnboarding } from "@desktop/hooks/state/use-onboarding";
import { useBackupProgress } from "@desktop/hooks/use-backup-progress";
import { useTheme } from "@desktop/hooks/use-theme";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { formatSize } from "@desktop/lib/number";
import {
  getPathName,
  getViewStep,
  ONBOARDING_STEPS,
  type OnboardingStep,
} from "@desktop/lib/onboarding";
import {
  CheckIcon,
  HardDriveIcon,
  LaptopIcon,
  LockIcon,
  LockOpenIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { type ReactNode, useMemo } from "react";

type NodeState = "pending" | "active" | "done";
type ConnectorState = "idle" | "linked" | "flowing";

const MAX_FOLDER_CHIPS = 7;
const PRESETS = ["schedule", "history"] as const;

export function OnboardingPlan() {
  const { t } = useAppTranslation("onboarding.plan");
  const { t: tProvider } = useAppTranslation("vault.providers");
  const { dark } = useTheme();

  const { view, storage, provider } = useOnboarding();
  const { vaultId } = useVaultId();
  const { data: vault } = useVault();
  const { data: space } = useSpace();
  const { selected, sizes } = useOnboardingFolders();
  const { view: backupView, sources } = useBackupProgress();

  const step = vaultId ? "backup" : getViewStep(view);
  const stepIndex = step ? ONBOARDING_STEPS.indexOf(step) : -1;

  function getNodeState(node: OnboardingStep): NodeState {
    const index = ONBOARDING_STEPS.indexOf(node);
    if (stepIndex > index) return "done";
    return stepIndex === index ? "active" : "pending";
  }

  const files = useMemo(
    () =>
      sources?.length
        ? sources.map((source) => ({
            path: source.source.path,
            name: source.name || getPathName(source.source.path),
            emoji: source.emoji,
          }))
        : selected,
    [sources, selected],
  );
  const filesBytes = files.every((file) => sizes[file.path] !== undefined)
    ? files.reduce((total, file) => total + (sizes[file.path] || 0), 0)
    : null;

  const filesState = getNodeState("folders");
  const storageState = getNodeState("storage");
  const encryptionState = getNodeState("password");

  const providerType = vaultId
    ? vault?.provider
    : storage === "CLOUDBLINK"
      ? "CLOUDBLINK"
      : provider;
  const StorageIcon = providerType
    ? providerIcons[providerType]
    : HardDriveIcon;

  const isRunning = backupView === "RUNNING";
  const isProtected = backupView === "DONE";
  const doneCount =
    PRESETS.length +
    [filesState, storageState, encryptionState].filter(
      (state) => state === "done",
    ).length;

  function getConnector(a: NodeState, b: NodeState): ConnectorState {
    if (isRunning) return "flowing";
    return a === "done" && b === "done" ? "linked" : "idle";
  }

  const filesCount = t("files.value", { count: files.length });

  return (
    <div className="onboarding-stage bg-sidebar relative flex h-full items-center justify-center overflow-hidden rounded-3xl border p-8">
      <div className="bg-card relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-xl shadow-black/5 dark:shadow-black/20">
        <div className="mb-6 flex h-6 items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">{t("title")}</h2>
          {isProtected ? (
            <span className="animate-in fade-in zoom-in-90 flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheckIcon className="size-3.5" />
              {t("status.protected")}
            </span>
          ) : isRunning ? (
            <span className="bg-primary/10 text-primary flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium">
              <span className="relative flex size-1.5">
                <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none" />
                <span className="bg-primary relative inline-flex size-1.5 rounded-full" />
              </span>
              {t("status.running")}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs tabular-nums">
              {t("ready", {
                done: doneCount,
                total: PRESETS.length + 3,
              })}
            </span>
          )}
        </div>
        <ol>
          <PlanNode
            state={filesState}
            icon={<LaptopIcon />}
            label={t("files.label")}
            value={
              filesState === "pending"
                ? t("files.pending")
                : filesBytes === null
                  ? filesCount
                  : t("files.valueSize", {
                      value: filesCount,
                      size: formatSize(filesBytes, { round: 1 }),
                    })
            }
            connector={getConnector(filesState, encryptionState)}
          >
            {filesState !== "pending" && files.length ? (
              <div className="mt-2 flex items-center gap-1">
                {files.slice(0, MAX_FOLDER_CHIPS).map((file) => (
                  <span
                    key={file.path}
                    title={file.name}
                    className="animate-in fade-in zoom-in-50 duration-300"
                  >
                    <SourceCard
                      emoji={file.emoji}
                      size={1.75}
                      theme={dark ? "dark" : "light"}
                    />
                  </span>
                ))}
                {files.length > MAX_FOLDER_CHIPS ? (
                  <span className="text-muted-foreground ml-1 text-xs tabular-nums">
                    +{files.length - MAX_FOLDER_CHIPS}
                  </span>
                ) : null}
              </div>
            ) : null}
          </PlanNode>
          <PlanNode
            state={encryptionState}
            icon={encryptionState === "done" ? <LockIcon /> : <LockOpenIcon />}
            label={t("encryption.label")}
            value={
              encryptionState === "done"
                ? t("encryption.value")
                : t("encryption.pending")
            }
            detail={
              encryptionState === "done" ? t("encryption.detail") : undefined
            }
            connector={getConnector(encryptionState, storageState)}
          />
          <PlanNode
            state={storageState}
            icon={
              storageState === "pending" ? (
                <HardDriveIcon />
              ) : (
                <StorageIcon className="size-6" />
              )
            }
            label={t("storage.label")}
            value={
              storageState === "pending"
                ? t("storage.pending")
                : providerType
                  ? tProvider(
                      `${resolveStorageProviderType(providerType)}.name`,
                    )
                  : t("storage.custom")
            }
            detail={
              storageState === "pending"
                ? undefined
                : providerType !== "CLOUDBLINK"
                  ? providerType
                    ? t("storage.custom")
                    : undefined
                  : space
                    ? t("storage.available", {
                        storage: formatSize(space.capacity - space.used),
                      })
                    : t("storage.cloudblink", {
                        storage: formatSize(TRIAL_STORAGE),
                        days: TRIAL_DAYS,
                      })
            }
          />
        </ol>
        <ul className="mt-6 space-y-2.5 border-t pt-5">
          {PRESETS.map((preset) => (
            <li key={preset} className="flex items-center gap-3 text-sm">
              <span className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full">
                <CheckIcon className="size-3" strokeWidth={3} />
              </span>
              {t(`presets.${preset}`)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type PlanNodeProps = {
  state: NodeState;
  icon: ReactNode;
  label: string;
  value: string;
  detail?: string;
  connector?: ConnectorState;
  children?: ReactNode;
};

function PlanNode({
  state,
  icon,
  label,
  value,
  detail,
  connector,
  children,
}: PlanNodeProps) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {connector ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 left-6 top-12 w-px -translate-x-1/2 transition-colors duration-500",
            connector === "idle"
              ? "border-border border-l border-dashed"
              : "bg-primary/40",
          )}
        >
          {connector === "flowing"
            ? [0, 0.7].map((delay) => (
                <span
                  key={delay}
                  style={{ animationDelay: `${delay}s` }}
                  className="bg-primary absolute left-1/2 size-1.5 -translate-x-1/2 rotate-45 animate-[onboarding-packet_1.4s_linear_infinite] rounded-[1px] opacity-0 motion-reduce:hidden"
                />
              ))
            : null}
        </span>
      ) : null}
      <div
        className={cn(
          "relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 [&>svg:not([class*='size-'])]:size-5",
          state === "pending" && "text-muted-foreground bg-card border-dashed",
          state === "active" &&
            "bg-background border-primary ring-primary/15 ring-4",
          state === "done" && "bg-primary/10 text-primary border-primary/25",
        )}
      >
        {icon}
        {state === "done" ? (
          <span className="bg-primary text-primary-foreground border-card animate-in zoom-in-50 fade-in absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border-2 duration-300">
            <CheckIcon className="size-2.5" strokeWidth={4} />
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <p
          className={cn(
            "truncate transition-colors duration-300",
            state === "pending"
              ? "text-muted-foreground text-sm leading-6"
              : "font-semibold",
          )}
        >
          {value}
        </p>
        {detail ? (
          <p className="text-muted-foreground truncate text-sm">{detail}</p>
        ) : null}
        {children}
      </div>
    </li>
  );
}
