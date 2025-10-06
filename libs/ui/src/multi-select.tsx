import { Badge } from "@ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@utils/class";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import * as React from "react";

interface MultiSelectProps {
  options?: { label: string; value: string }[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  className,
  triggerClassName,
  isLoading = false,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (
    item: string,
    event?:
      | React.MouseEvent<HTMLSpanElement>
      | React.KeyboardEvent<HTMLSpanElement>,
  ) => {
    if (event) event.stopPropagation();
    onChange(value.filter((i) => i !== item));
  };

  const handleSelect = (item: string) => {
    if (value.includes(item)) {
      handleUnselect(item);
    } else {
      onChange([...value, item]);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "border-input bg-card flex h-12 w-full items-center justify-between rounded-md border text-sm transition-all",
            "focus:ring-ring focus:outline-none focus:ring-2 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName,
          )}
          disabled={disabled}
          aria-expanded={open}
        >
          <div className="flex flex-1 justify-between overflow-hidden">
            <div
              className="flex flex-1 gap-1 overflow-x-auto py-2 pl-3"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "hsl(var(--border)) transparent",
              }}
            >
              {value?.length === 0 ? (
                <span className="text-muted-foreground truncate">
                  {placeholder}
                </span>
              ) : (
                value?.map((item) => {
                  const option = options?.find((opt) => opt.value === item);
                  return (
                    <Badge key={item} variant="outline" className="text-xs">
                      {option?.label}
                      <span
                        role="button"
                        tabIndex={0}
                        className="hover:bg-muted rounded-full p-0.5 transition-all"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleUnselect(item, e)
                        }
                        onClick={(e) => handleUnselect(item, e)}
                      >
                        <XIcon className="h-3 w-3" />
                      </span>
                    </Badge>
                  );
                })
              )}
            </div>
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((prev) => !prev);
              }}
              tabIndex={0}
              className={cn(
                "mx-1.5 my-auto h-full p-1 outline-none",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
                "hover:bg-accent/50 cursor-pointer rounded-sm",
              )}
            >
              <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50" />
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput autoFocus={false} placeholder="Search items..." />
            <CommandList>
              <CommandEmpty className="p-0">
                {isLoading ? (
                  <div className="p-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="mb-1 h-4 w-full last:mb-0"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground py-4 text-center text-sm">
                    No items found.
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup>
                {options?.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
