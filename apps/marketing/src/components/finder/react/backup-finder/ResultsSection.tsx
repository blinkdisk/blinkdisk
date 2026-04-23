import { Button } from "@blinkdisk/ui/button";
import { RotateCcwIcon, SearchXIcon } from "lucide-react";

import type { NormalizedBackupTool } from "@blinkdisk/utils/tools";
import { FinderResultCard } from "../FinderResultCard";

type ResultsSectionProps = {
  results: NormalizedBackupTool[];
  zeroMatches: boolean;
  activeCount: number;
  selectedComparisonSlugs: string[];
  onResetAll: () => void;
  onToggleComparison: (slug: string) => void;
};

export function ResultsSection({
  results,
  zeroMatches,
  activeCount,
  selectedComparisonSlugs,
  onResetAll,
  onToggleComparison,
}: ResultsSectionProps) {
  return (
    <section>
      <div className="mb-6 hidden items-center justify-between md:flex">
        <p className="text-muted-foreground text-sm">
          Showing{" "}
          <span className="text-foreground font-medium">{results.length}</span>{" "}
          {results.length === 1 ? "tool" : "tools"}
          {activeCount > 0 && <> matching your requirements</>}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onResetAll}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
          >
            <RotateCcwIcon className="size-3.5" />
            Reset all
          </button>
        )}
      </div>

      {zeroMatches ? (
        <div className="bg-card flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <SearchXIcon className="size-6" />
          </div>
          <div>
            <h3 className="text-foreground text-lg font-semibold">
              No tools match every requirement
            </h3>
            <p className="text-muted-foreground mt-1 max-w-md text-sm">
              Try loosening your filters. Your current selection is too
              restrictive - no single backup tool ticks every box.
            </p>
          </div>
          <Button size="sm" onClick={onResetAll}>
            <RotateCcwIcon className="size-4" />
            Reset all filters
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {results.map((tool) => (
            <li key={tool.slug}>
              <FinderResultCard
                tool={tool}
                isSelectedForComparison={selectedComparisonSlugs.includes(
                  tool.slug,
                )}
                onToggleComparison={onToggleComparison}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
