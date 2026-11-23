import { SourceCard } from "@blinkdisk/components/source-card";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { cn } from "@blinkdisk/utils/class";
import {
  OnboardingHeading,
  OnboardingSection,
} from "@desktop/components/onboarding/step";
import { useOnboardingFolders } from "@desktop/hooks/queries/use-onboarding-folders";
import { useOnboarding } from "@desktop/hooks/state/use-onboarding";
import { useTheme } from "@desktop/hooks/use-theme";
import { formatSize } from "@desktop/lib/number";
import type { OnboardingFolder } from "@desktop/lib/onboarding";
import { ArrowRightIcon, CheckIcon, FolderPlusIcon } from "lucide-react";

export function OnboardingFolders() {
  const { t } = useAppTranslation("onboarding.folders");
  const { setView, selectFolder, addFolder } = useOnboarding();
  const { folders, sizes, summary, isMeasuring } = useOnboardingFolders();

  async function chooseFolder() {
    const result = await window.electron.dialog.open({
      title: t("dialogTitle"),
      properties: ["openDirectory"],
    });

    const path = result.filePaths[0];
    if (!result.canceled && path) addFolder(path);
  }

  const count = t("summary", { count: summary.count });
  const isEmptySelection = !!folders && !summary.count;

  return (
    <>
      <OnboardingHeading title={t("title")} description={t("description")} />
      <OnboardingSection className="mt-8">
        {folders?.length === 0 ? (
          <p className="text-muted-foreground mb-3 text-sm">{t("empty")}</p>
        ) : null}
        <div className="grid grid-cols-2 gap-2.5">
          {folders
            ? folders.map((folder) => (
                <FolderTile
                  key={folder.path}
                  folder={folder}
                  size={sizes[folder.path]}
                  isMeasuring={isMeasuring}
                  onToggle={() => selectFolder(folder.path, !folder.selected)}
                />
              ))
            : [1, 2, 3, 4, 5, 6].map((key) => (
                <Skeleton key={key} height="4rem" className="rounded-xl" />
              ))}
          <button
            type="button"
            onClick={chooseFolder}
            className="text-muted-foreground hover:text-foreground hover:border-foreground/30 focus-visible:ring-ring/50 focus-visible:ring-3 flex h-16 items-center justify-center gap-2.5 rounded-xl border border-dashed text-sm font-medium outline-none transition-colors"
          >
            <FolderPlusIcon className="size-4" />
            {t("add")}
          </button>
        </div>
      </OnboardingSection>
      <OnboardingSection
        order={2}
        className="mt-8 flex items-center justify-between gap-4"
      >
        <p
          className={cn(
            "text-sm tabular-nums",
            isEmptySelection ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {!folders
            ? null
            : isEmptySelection
              ? t("none")
              : !isMeasuring
                ? count
                : summary.isCalculating
                  ? t("summaryCalculating", { summary: count })
                  : t("summarySize", {
                      summary: count,
                      size: formatSize(summary.bytes, { round: 1 }),
                    })}
        </p>
        <Button
          size="lg"
          disabled={!summary.count}
          onClick={() => setView("storage")}
        >
          {t("continue")}
          <ArrowRightIcon />
        </Button>
      </OnboardingSection>
    </>
  );
}

type FolderTileProps = {
  folder: OnboardingFolder;
  size: number | undefined;
  isMeasuring: boolean;
  onToggle: () => void;
};

function FolderTile({ folder, size, isMeasuring, onToggle }: FolderTileProps) {
  const { t } = useAppTranslation("onboarding.folders");
  const { dark } = useTheme();

  return (
    // biome-ignore lint/a11y/useSemanticElements: a native checkbox can't hold the tile's content
    <button
      type="button"
      role="checkbox"
      aria-checked={folder.selected}
      title={folder.path}
      onClick={onToggle}
      className={cn(
        "focus-visible:ring-ring/50 focus-visible:ring-3 flex h-16 min-w-0 items-center gap-3 rounded-xl border px-3 text-left outline-none transition-colors",
        folder.selected
          ? "bg-card border-primary/50"
          : "hover:bg-card border-border",
      )}
    >
      <SourceCard
        emoji={folder.emoji}
        size={2.25}
        theme={dark ? "dark" : "light"}
        className={cn(
          "transition-opacity",
          !folder.selected && "opacity-60 grayscale",
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="ph-no-capture block truncate text-sm font-medium">
          {folder.name}
        </span>
        <span className="text-muted-foreground ph-no-capture block truncate text-xs tabular-nums">
          {!folder.selected || !isMeasuring
            ? folder.path
            : size === undefined
              ? t("calculating")
              : formatSize(size, { round: 1 })}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          folder.selected
            ? "bg-primary border-primary text-primary-foreground"
            : "border-input bg-secondary",
        )}
      >
        {folder.selected ? (
          <CheckIcon className="size-3.5" strokeWidth={3} />
        ) : null}
      </span>
    </button>
  );
}
