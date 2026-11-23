import { SourceCard } from "@blinkdisk/components/source-card";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { CircularProgress } from "@blinkdisk/ui/circular-progress";
import { Loader } from "@blinkdisk/ui/loader";
import { cn } from "@blinkdisk/utils/class";
import {
  OnboardingHeading,
  OnboardingSection,
} from "@desktop/components/onboarding/step";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import { useOnboardingFolders } from "@desktop/hooks/queries/use-onboarding-folders";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import {
  type FirstBackupStage,
  useOnboarding,
} from "@desktop/hooks/state/use-onboarding";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useBackupProgress } from "@desktop/hooks/use-backup-progress";
import { useFirstBackup } from "@desktop/hooks/use-first-backup";
import { useOnboardingExit } from "@desktop/hooks/use-onboarding-exit";
import { useTheme } from "@desktop/hooks/use-theme";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { formatInt, formatSize } from "@desktop/lib/number";
import {
  type FolderBackupState,
  getPathName,
  type summarizeBackup,
} from "@desktop/lib/onboarding";
import {
  ArrowRightIcon,
  BellIcon,
  CalendarClockIcon,
  CheckIcon,
  HistoryIcon,
  TriangleAlertIcon,
} from "lucide-react";

type Backup = ReturnType<typeof summarizeBackup>;

const stages: FirstBackupStage[] = ["VAULT", "FOLDERS", "UPLOAD"];

export function OnboardingBackup() {
  const { t } = useAppTranslation("onboarding.backup");
  const { vaultId } = useVaultId();
  const { isLocalAccount } = useAccountId();
  const { firstBackup } = useOnboarding();
  const { selected } = useOnboardingFolders();
  const { view, backup, profile, failedPaths } = useBackupProgress();
  const { startFirstBackup } = useFirstBackup();
  const { exitOnboarding } = useOnboardingExit();
  const { openAuthDialog } = useAuthDialog();
  const {
    mutate: resumeBackup,
    isPending: isResuming,
    isSuccess: hasResumed,
  } = useStartBackup({ profile });

  const exit = () => exitOnboarding("completed", { backup: view });

  if (view === "STARTING") {
    const current =
      firstBackup.status === "PENDING" ? stages.indexOf(firstBackup.stage) : 0;

    return (
      <div key="starting">
        <OnboardingHeading
          title={t("starting.title")}
          description={t("starting.description")}
        />
        <OnboardingSection className="mt-8">
          <ol className="grid gap-4">
            {stages.map((stage, index) => {
              const isDone =
                firstBackup.status === "STARTED" || index < current;

              return (
                <li
                  key={stage}
                  className={cn(
                    "flex items-center gap-3 text-sm transition-colors",
                    !isDone && index > current && "text-muted-foreground",
                  )}
                >
                  <span className="flex size-6 items-center justify-center">
                    {isDone ? (
                      <span className="bg-primary text-primary-foreground animate-in zoom-in-50 flex size-5 items-center justify-center rounded-full">
                        <CheckIcon className="size-3" strokeWidth={3} />
                      </span>
                    ) : index === current ? (
                      <Loader small />
                    ) : (
                      <span className="size-2 rounded-full bg-current opacity-30" />
                    )}
                  </span>
                  {t(`starting.steps.${stage}`)}
                </li>
              );
            })}
          </ol>
        </OnboardingSection>
      </div>
    );
  }

  if (view === "ERROR" || view === "PAUSED") {
    const canRetry =
      view === "ERROR" &&
      firstBackup.status === "ERROR" &&
      !!vaultId &&
      selected.length > 0;

    return (
      <div key={view}>
        <OnboardingHeading
          title={t(view === "ERROR" ? "error.title" : "paused.title")}
          description={t(
            view === "ERROR" ? "error.description" : "paused.description",
          )}
        />
        <OnboardingSection className="mt-8 flex items-center gap-3">
          {view === "PAUSED" ? (
            <Button
              size="lg"
              loading={isResuming || hasResumed}
              onClick={() => resumeBackup({})}
            >
              {t("paused.resume")}
            </Button>
          ) : canRetry ? (
            <Button
              size="lg"
              onClick={() => startFirstBackup(vaultId, selected)}
            >
              {t("error.retry")}
            </Button>
          ) : null}
          <Button
            size="lg"
            variant={view === "PAUSED" || canRetry ? "secondary" : "default"}
            onClick={exit}
          >
            {t("open")}
          </Button>
        </OnboardingSection>
      </div>
    );
  }

  if (view === "RUNNING") {
    return (
      <div key="running">
        <OnboardingHeading
          title={t("running.title")}
          description={t("running.description")}
        />
        <OnboardingSection className="mt-8">
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-end justify-between gap-4">
              <p className="text-4xl font-bold tabular-nums leading-none tracking-tight">
                {backup.progress.toLocaleString(undefined, {
                  style: "percent",
                })}
              </p>
              <p className="text-muted-foreground text-sm tabular-nums">
                {t("stats.progress", {
                  files: t("stats.files", {
                    count: backup.protectedFiles,
                    formatted: formatInt(backup.protectedFiles),
                  }),
                  size: formatSize(backup.protectedBytes, { round: 1 }),
                })}
              </p>
            </div>
            <div className="bg-foreground/10 mt-4 h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-[width] duration-1000 ease-linear"
                style={{ width: `${Math.max(backup.progress * 100, 2)}%` }}
              />
            </div>
            <FolderList
              backup={backup}
              failedPaths={failedPaths}
              className="mt-5 border-t pt-4"
            />
          </div>
        </OnboardingSection>
        <OnboardingSection order={2} className="mt-6">
          <p className="text-muted-foreground text-sm">
            {t("running.background")}
          </p>
          <Button size="lg" className="mt-5" onClick={exit}>
            {t("continue")}
            <ArrowRightIcon />
          </Button>
        </OnboardingSection>
      </div>
    );
  }

  if (view === "ISSUE") {
    return (
      <div key="issue">
        <div className="animate-in zoom-in-75 fade-in mb-6 flex size-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 duration-500 dark:text-amber-500">
          <TriangleAlertIcon className="size-6" />
        </div>
        <OnboardingHeading
          title={t("issue.title")}
          description={t("issue.description")}
        />
        <OnboardingSection className="mt-8">
          <FolderList
            backup={backup}
            failedPaths={failedPaths}
            className="bg-card rounded-xl border px-5 py-4"
          />
          <Button size="lg" className="mt-6" onClick={exit}>
            {t("open")}
            <ArrowRightIcon />
          </Button>
        </OnboardingSection>
      </div>
    );
  }

  return (
    <div key="done">
      <div className="relative mb-6 size-14">
        <span className="absolute inset-0 animate-[onboarding-ring_1.2s_ease-out_0.2s_both] rounded-full bg-emerald-500/40 motion-reduce:hidden" />
        <span className="animate-in zoom-in-50 fade-in relative flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white duration-500">
          <CheckIcon className="size-7" strokeWidth={3} />
        </span>
      </div>
      <OnboardingHeading
        title={t("done.title")}
        description={t("done.description")}
      />
      <OnboardingSection className="mt-8">
        <div className="bg-card rounded-xl border">
          <dl className="grid grid-cols-2 divide-x">
            <Stat
              value={formatInt(backup.protectedFiles)}
              label={t("done.files", { count: backup.protectedFiles })}
            />
            <Stat
              value={formatSize(backup.protectedBytes, { round: 1 })}
              label={t("done.size")}
            />
          </dl>
          <ul className="text-muted-foreground grid gap-2.5 border-t px-5 py-4 text-sm">
            <li className="flex items-center gap-3">
              <CalendarClockIcon className="size-4 shrink-0" />
              {t("done.next")}
            </li>
            <li className="flex items-center gap-3">
              <HistoryIcon className="size-4 shrink-0" />
              {t("done.restore")}
            </li>
          </ul>
        </div>
      </OnboardingSection>
      <OnboardingSection order={2} className="mt-6">
        <Button size="xl" onClick={exit}>
          {t("open")}
          <ArrowRightIcon />
        </Button>
        {isLocalAccount ? (
          <div className="mt-8 flex items-center gap-4 border-t pt-6">
            <BellIcon className="text-muted-foreground size-4 shrink-0" />
            <p className="text-muted-foreground flex-1 text-sm">
              {t("account.description")}
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                await exit();
                openAuthDialog();
              }}
            >
              {t("account.button")}
            </Button>
          </div>
        ) : null}
      </OnboardingSection>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col-reverse px-5 py-4">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-2xl font-bold tabular-nums tracking-tight">
        {value}
      </dd>
    </div>
  );
}

const folderStateStyles: Record<FolderBackupState, string> = {
  WAITING: "text-muted-foreground",
  RUNNING: "text-foreground",
  DONE: "text-emerald-600 dark:text-emerald-400",
  ISSUE: "text-amber-600 dark:text-amber-500",
};

function FolderList({
  backup,
  failedPaths,
  className,
}: {
  backup: Backup;
  failedPaths: string[];
  className?: string;
}) {
  const { t } = useAppTranslation("onboarding.backup.folder");
  const { dark } = useTheme();

  return (
    <ul className={cn("grid max-h-44 gap-3 overflow-y-auto", className)}>
      {backup.items.map(({ source, state, progress }) => (
        <li key={source.id} className="flex items-center gap-3">
          <SourceCard
            emoji={source.emoji}
            size={1.75}
            theme={dark ? "dark" : "light"}
          />
          <p className="ph-no-capture min-w-0 flex-1 truncate text-sm font-medium">
            {source.name || getPathName(source.source.path)}
          </p>
          <div
            className={cn(
              "flex items-center gap-2 text-xs font-medium tabular-nums",
              folderStateStyles[state],
            )}
          >
            {state === "RUNNING"
              ? progress.toLocaleString(undefined, { style: "percent" })
              : t(state)}
            {state === "RUNNING" ? (
              <CircularProgress
                value={progress * 100}
                size={14}
                strokeWidth={3}
                className="text-primary"
                progressClassName="text-primary"
              />
            ) : state === "DONE" ? (
              <CheckIcon className="size-3.5" strokeWidth={3} />
            ) : state === "ISSUE" ? (
              <TriangleAlertIcon className="size-3.5" />
            ) : null}
          </div>
        </li>
      ))}
      {failedPaths.map((path) => (
        <li key={path} className="flex items-center gap-3">
          <SourceCard size={1.75} theme={dark ? "dark" : "light"} />
          <p className="ph-no-capture min-w-0 flex-1 truncate text-sm font-medium">
            {getPathName(path)}
          </p>
          <div
            className={cn(
              "flex items-center gap-2 text-xs font-medium",
              folderStateStyles.ISSUE,
            )}
          >
            {t("FAILED")}
            <TriangleAlertIcon className="size-3.5" />
          </div>
        </li>
      ))}
    </ul>
  );
}
