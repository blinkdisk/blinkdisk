import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@blinkdisk/ui/combobox";
import { PlusIcon, XIcon } from "lucide-react";

type ToolSelectorProps = {
  tools: { label: string; value: string }[];
  selectedSlugs: string[];
  index: number;
  showRemove?: boolean;
};

export function ToolSelector({
  tools,
  selectedSlugs,
  index,
  showRemove,
}: ToolSelectorProps) {
  const currentSlug = selectedSlugs[index];

  const handleValueChange = (newSlug: string | null) => {
    const newSlugs = [...selectedSlugs];
    if (newSlug) newSlugs[index] = newSlug;
    window.location.href = `/compare/${newSlugs.join("-vs-")}`;
  };

  const handleRemove = () => {
    const newSlugs = selectedSlugs.filter((_, i) => i !== index);
    if (newSlugs.length === 0) {
      window.location.href = "/compare";
    } else {
      window.location.href = `/compare/${newSlugs.join("-vs-")}`;
    }
  };

  return (
    <div className="flex gap-2">
      <Combobox
        items={tools}
        onValueChange={(item) => item && handleValueChange(item.value)}
        value={tools.find((t) => t.value === currentSlug) ?? null}
      >
        <ComboboxInput className="h-11 flex-1" placeholder="Select a tool..." />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {showRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition-colors"
          aria-label="Remove from comparison"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}

type AddToolButtonProps = {
  tools: { label: string; value: string }[];
  selectedSlugs: string[];
};

export function AddToolButton({ tools, selectedSlugs }: AddToolButtonProps) {
  const availableTools = tools.filter(
    (tool) => !selectedSlugs.includes(tool.value),
  );

  const handleAddTool = (slug: string) => {
    const newSlugs = [...selectedSlugs, slug];
    window.location.href = `/compare/${newSlugs.join("-vs-")}`;
  };

  if (selectedSlugs.length >= 3) {
    return null;
  }

  const isFirstTool = selectedSlugs.length === 0;

  return (
    <div className="border-muted-foreground/30 from-muted/50 to-muted/20 flex h-full min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-gradient-to-b p-6">
      <div className="bg-primary/10 text-primary border-primary/20 flex size-12 items-center justify-center rounded-xl border">
        <PlusIcon className="size-6" />
      </div>
      <div className="text-center">
        <h3 className="text-foreground text-xl font-semibold">
          Add {isFirstTool ? "a" : "another"} tool
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose {isFirstTool ? "a" : "another"} tool to start comparing
        </p>
      </div>

      <Combobox<{ label: string; value: string }>
        items={availableTools}
        onValueChange={(item) => item && handleAddTool(item.value)}
      >
        <ComboboxInput placeholder="Select a tool..." />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
