import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { SlidersHorizontalIcon } from "lucide-react";

type PolicyAdvancedModeBannerProps = {
  onSwitchToAdvanced: () => void;
};

export function PolicyAdvancedModeBanner({
  onSwitchToAdvanced,
}: PolicyAdvancedModeBannerProps) {
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
