import { PolicyContext } from "@desktop/components/policy/context";
import { useFolderSize } from "@desktop/hooks/queries/core/use-folder-size";
import { formatInt, formatSize } from "@desktop/lib/number";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertTitle } from "@ui/alert";
import { Button } from "@ui/button";
import {
  AlertTriangleIcon,
  CheckIcon,
  FileIcon,
  FolderSearch2Icon,
  HardDriveIcon,
  XIcon,
} from "lucide-react";
import { useContext, useEffect } from "react";

type FolderSizeProps = {
  path: string;
  setSize: (size: number | null) => void;
};

export function FolderSize({ path, setSize }: FolderSizeProps) {
  const { t } = useAppTranslation("folder.createDialog");
  const { policy } = useContext(PolicyContext);

  const { startEstimation, isLoading, isRunning, isSuccess, isError, result } =
    useFolderSize({
      path,
      policy: policy?.effective,
      enabled: !!path,
    });

  useEffect(() => {
    setSize(
      result && result.included && result.included.bytes !== undefined
        ? result?.included?.bytes
        : null,
    );
  }, [result, setSize]);

  if (!path) return null;
  return (
    <div className="bg-card mt-2 flex flex-col gap-4 rounded-lg border p-4">
      {isSuccess && result ? (
        <div className="grid grid-cols-4 gap-y-1.5 text-sm">
          <div className="col-span-2 font-medium">
            <CheckIcon className="mb-0.5 mr-2 inline-block size-4 text-green-500" />
            {t("size.included")}
          </div>
          <div className="flex items-center gap-1.5">
            <FileIcon className="text-muted-foreground size-4" />
            <span>{formatInt(result.included.files)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDriveIcon className="text-muted-foreground size-4" />
            <span>{formatSize(result.included.bytes)}</span>
          </div>

          <div className="col-span-2 font-medium">
            <XIcon className="mb-0.5 mr-2 inline-block size-4 text-red-500" />
            {t("size.excluded")}
          </div>
          <div className="flex items-center gap-1.5">
            <FileIcon className="text-muted-foreground size-4" />
            <span>{formatInt(result.excluded.files)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDriveIcon className="text-muted-foreground size-4" />
            <span>{formatSize(result.excluded.bytes)}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold">{t("size.title")}</h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {t("size.description")}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={startEstimation}
              loading={isLoading || isRunning}
            >
              <FolderSearch2Icon />
              {t("size.button")}
            </Button>
          </div>

          {isError && (
            <Alert>
              <AlertTriangleIcon />
              <AlertTitle>{t("size.error")}</AlertTitle>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
