import { Button } from "@blinkdisk/ui/button";
import { RotateCcwIcon, ScaleIcon, XIcon } from "lucide-react";

import type { NormalizedBackupTool } from "@blinkdisk/utils/tools";

type ComparisonBarProps = {
  selectedTools: NormalizedBackupTool[];
  canCompare: boolean;
  onClearSelection: () => void;
  onRemoveSelection: (slug: string) => void;
  onCompare: () => void;
};

export function ComparisonBar({
  selectedTools,
  canCompare,
  onClearSelection,
  onRemoveSelection,
  onCompare,
}: ComparisonBarProps) {
  if (selectedTools.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[1010] px-4">
      <div className="bg-background/90 border-border/70 pointer-events-auto mx-auto flex w-full max-w-5xl flex-col gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-wrap gap-2">
          {selectedTools.map((tool) => (
            <button
              key={tool.slug}
              type="button"
              onClick={() => onRemoveSelection(tool.slug)}
              className="bg-muted text-foreground hover:bg-muted/80 inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
              aria-label={`Remove ${tool.name} from comparison`}
            >
              <span className="truncate">{tool.name}</span>
              <XIcon className="text-muted-foreground size-3.5 shrink-0" />
            </button>
          ))}
        </div>

        <div className="flex gap-2 md:shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={onClearSelection}
            className="flex-1 md:flex-none"
          >
            <RotateCcwIcon className="size-4" />
            Clear
          </Button>
          <Button
            type="button"
            onClick={onCompare}
            disabled={!canCompare}
            className="flex-1 md:flex-none"
          >
            <ScaleIcon className="size-4" />
            Compare
          </Button>
        </div>
      </div>
    </div>
  );
}
