import { Empty } from "@desktop/components/empty";
import { useCreateFolderDialog } from "@desktop/hooks/state/use-create-folder-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import { FolderPlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function FolderDropzone() {
  const { t } = useAppTranslation("folder.dropzone");
  const [isDragging, setIsDragging] = useState(false);
  const { openCreateFolder } = useCreateFolderDialog();

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const hasFiles = e.dataTransfer?.types.includes("Files");
    if (!hasFiles) return;

    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";

    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const relatedTarget = e.relatedTarget as Node | null;
    if (
      !relatedTarget ||
      relatedTarget === document.body ||
      relatedTarget.nodeName === "HTML"
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const firstFile = files[0];
      if (!firstFile) return;

      const firstPath = window.electron.fs.getPathFromFile(firstFile);

      const isDir = await window.electron.fs.isDirectory(firstPath);

      const targetName = await window.electron.path.basename(firstPath);

      openCreateFolder({
        path: firstPath,
        name: targetName,
        type: isDir ? "folder" : "file",
      });
    },
    [openCreateFolder],
  );

  useEffect(() => {
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleDragOver, handleDragLeave, handleDrop]);

  if (!isDragging) return null;

  return (
    <div className="bg-background/20 fixed inset-0 z-[100] flex items-center justify-center backdrop-blur">
      <Empty
        icon={<FolderPlusIcon />}
        title={t("title")}
        description={t("description")}
      />
    </div>
  );
}
