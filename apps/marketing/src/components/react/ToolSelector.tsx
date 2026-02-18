import { PlusIcon, XIcon } from "lucide-react";
import { Combobox, type ComboboxOption } from "@ui/combobox";

type ToolSelectorProps = {
  tools: ComboboxOption[];
  selectedSlugs: string[];
  index: number;
  showRemove?: boolean;
};

export function ToolSelector({ tools, selectedSlugs, index, showRemove }: ToolSelectorProps) {
  const currentSlug = selectedSlugs[index];

  const handleValueChange = (newSlug: string) => {
    const newSlugs = [...selectedSlugs];
    newSlugs[index] = newSlug;
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
        options={tools}
        value={currentSlug}
        onValueChange={handleValueChange}
        placeholder="Select a tool..."
        searchPlaceholder="Search backup tools..."
        emptyText="No tools found."
        triggerClassName="flex-1"
      />
      {showRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Remove from comparison"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}

type AddToolButtonProps = {
  tools: ComboboxOption[];
  selectedSlugs: string[];
};

export function AddToolButton({ tools, selectedSlugs }: AddToolButtonProps) {
  const availableTools = tools.filter(
    (tool) => !selectedSlugs.includes(tool.value)
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
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-gradient-to-b from-muted/50 to-muted/20 p-6">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
        <PlusIcon className="size-6" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground text-xl">
           Add {isFirstTool ? "a" : "another"} tool
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
           Choose {isFirstTool ? "a" : "another"} tool to start comparing
        </p>
      </div>
      <Combobox
        options={availableTools}
        onValueChange={handleAddTool}
        placeholder="Select a tool..."
        searchPlaceholder="Search backup tools..."
        emptyText="No more tools available."
        triggerClassName="w-full max-w-[220px]"
      />
    </div>
  );
}
