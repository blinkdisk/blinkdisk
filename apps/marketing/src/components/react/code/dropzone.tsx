import type { ButtonProps } from "@ui/button";
import { Button } from "@ui/button";
import { Loader } from "@ui/loader";
import { cn } from "@utils/class";
import { FileIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";

type CodeStatsDropzoneProps = {
  buttonVariant?: ButtonProps["variant"];
  onFileChange?: (file: File) => void;
  loading?: boolean;
};

export function CodeStatsDropzone({
  buttonVariant,
  onFileChange,
  loading,
}: CodeStatsDropzoneProps) {
  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"],
    },
    maxFiles: 1,
    onDropAccepted: async (files) => {
      if (!files.length) return;
      onFileChange?.(files[0]!);
    },
  });

  return (
    <button
      {...getRootProps()}
      className={cn(
        "border-foreground/20 mt-4 cursor-pointer rounded-xl border-2 border-dashed p-1 transition-colors focus-visible:outline-none",
        isDragActive
          ? "border-primary"
          : "hover:border-foreground/30 focus-visible:border-primary",
      )}
    >
      <div className="bg-muted relative flex flex-col items-center justify-center rounded-lg px-12 py-8">
        {loading ? (
          <Loader
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            size={1.5}
          />
        ) : null}
        <input {...getInputProps()} />
        <Button
          className={cn(
            "pointer-events-none w-fit px-5",
            loading && "invisible",
          )}
          size="lg"
          tabIndex={-1}
          variant={buttonVariant}
        >
          <FileIcon /> Select .zip file
        </Button>
        <p
          className={cn(
            "text-muted-foreground mt-4 text-sm",
            loading && "invisible",
          )}
        >
          or drag and drop it here.
        </p>
      </div>
    </button>
  );
}
