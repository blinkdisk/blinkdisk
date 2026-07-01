import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Empty } from "@desktop/components/empty";
import { useCreateSourceDialog } from "@desktop/hooks/state/use-create-source-dialog";
import { FolderPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function SourceDropzone() {
  const { t } = useAppTranslation("folder.dropzone");
  const [isDragging, setIsDragging] = useState(false);
  const { openCreateSource } = useCreateSourceDialog();

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const hasFiles = e.dataTransfer?.types.includes("Files");
      if (!hasFiles) return;

      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";

      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
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
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const firstFile = files[0];
      if (!firstFile) return;

      const firstPath = window.electron.fs.getPathFromFile(firstFile);

      const [type, name] = await Promise.all([
        window.electron.fs.sourceType(firstPath),
        window.electron.path.basename(firstPath),
      ]);

      openCreateSource({ path: firstPath, name, type });
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [openCreateSource]);

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
