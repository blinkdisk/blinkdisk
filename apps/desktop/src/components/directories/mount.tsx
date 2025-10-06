import { useStopMount } from "@desktop/hooks/mutations/core/use-stop-mount";
import { useMount } from "@desktop/hooks/queries/core/use-mount";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { FolderSymlinkIcon, SquareIcon } from "lucide-react";

export function DirectoryMount() {
  const { data: mount } = useMount();
  const { t } = useAppTranslation("directory.table");
  const { mutate: stopMount, isPending: isStopMountPending } = useStopMount();

  if (!mount) return null;
  return (
    <div className="bg-card mt-6 flex w-full shrink-0 items-center justify-between overflow-hidden rounded-xl border p-3">
      <div className="flex w-full min-w-0 items-center gap-3">
        <div className="bg-foreground/5 border-foreground/10 flex size-9 shrink-0 items-center justify-center rounded-md border">
          <FolderSymlinkIcon className="text-muted-foreground size-4" />
        </div>
        <div className="flex w-full min-w-0 flex-col">
          <p className="max-w-full truncate font-medium">
            {t("mount.active.title")}
          </p>
          <p className="text-muted-foreground max-w-full truncate text-xs">
            {t("mount.active.description", {
              path: mount.path,
            })}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          onClick={() => stopMount()}
          loading={isStopMountPending}
          size="sm"
        >
          <SquareIcon />
          {t("mount.stop.button")}
        </Button>
      </div>
    </div>
  );
}
