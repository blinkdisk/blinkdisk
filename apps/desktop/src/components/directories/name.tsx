import { Item } from "@desktop/components/directories/table";
import { useAppTranslation } from "@hooks/use-app-translation";
import { CellContext } from "@tanstack/react-table";
import { Loader } from "@ui/loader";
import { Skeleton } from "@ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { cn } from "@utils/class";
import { FileSymlinkIcon, FolderIcon } from "lucide-react";
import { useMemo } from "react";
import seedrandom from "seedrandom";

type DirectoryNameCellProps = {
  info: CellContext<Item, string> & { isPending?: boolean };
  dark: boolean;
};

export function DirectoryNameCell({ info, dark }: DirectoryNameCellProps) {
  const directory = info.row.original;
  const { t } = useAppTranslation("directory.table");

  const extension = useMemo(() => {
    if (!directory || directory.type === "DIRECTORY") return null;
    const parts = directory?.name.split(".");
    if (parts.length < 2) return null;
    return parts.at(-1);
  }, [directory]);

  const hsl = useMemo(() => {
    if (directory?.type === "DIRECTORY") return "0 0% 50%";

    const rng = seedrandom(extension || "?")();
    return `${rng * 360} 70% ${dark ? "60%" : "40%"}`;
  }, [directory, extension, dark]);

  return (
    <>
      <div className="mr-3">
        {info.isPending ? (
          <div className="flex size-8 items-center justify-center">
            <Loader />
          </div>
        ) : directory && directory.skeleton ? (
          <Skeleton width="2rem" height="2rem" />
        ) : directory ? (
          <div
            style={{
              background: `hsl(${hsl} / 0.1)`,
              borderColor: `hsl(${hsl} / 0.2)`,
              color: `hsl(${hsl})`,
            }}
            className="flex size-8 items-center justify-center overflow-hidden rounded-md border"
          >
            {directory.type === "DIRECTORY" ? (
              <FolderIcon className="text-muted-foreground size-4" />
            ) : (
              <span
                className={cn(
                  "mt-0.5 text-[0.6rem] font-medium",
                  !extension && "text-xs",
                )}
              >
                {extension ? extension.slice(0, 3).toUpperCase() : "?"}
              </span>
            )}
          </div>
        ) : null}
      </div>
      {directory.skeleton ? <Skeleton width={200} /> : info.getValue()}{" "}
      {directory.type === "SYMLINK" ? (
        <Tooltip>
          <TooltipTrigger>
            <FileSymlinkIcon className="text-primary ml-2 size-4" />
          </TooltipTrigger>
          <TooltipContent>{t("symlink.tooltip")}</TooltipContent>
        </Tooltip>
      ) : null}
    </>
  );
}
