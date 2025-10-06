import { FormDisabledContext, useFieldContext } from "@hooks/use-app-form";
import { Button, ButtonProps } from "@ui/button";
import { LabelContainer, LabelContainerProps } from "@ui/label";
import { cn } from "@utils/class";
import { FileIcon, FolderIcon, TrashIcon } from "lucide-react";
import React, { useCallback, useContext, useState } from "react";

const Path = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "onClick" | "children"> & {
    label: LabelContainerProps;
  } & {
    placeholder?: string;
    title: string;
    type: "directory" | "file";
    defaultFileName?: string;
    mode?: "open" | "save";
  }
>(
  (
    {
      className,
      label,
      placeholder,
      title,
      type,
      mode,
      defaultFileName,
      disabled,
    },
    ref,
  ) => {
    const field = useFieldContext<string>();
    const disabledContext = useContext(FormDisabledContext);

    const [loading, setLoading] = useState(false);

    const onClickCallback = useCallback(async () => {
      setLoading(true);

      if (mode === "save") {
        const result = await window.electron?.dialog.save({
          title,
          defaultFileName,
        });

        if (!result.canceled && result.filePath)
          field.handleChange(result.filePath);
      } else {
        const result = await window.electron?.dialog.open({
          properties:
            type === "directory"
              ? ["openDirectory", "createDirectory"]
              : ["openFile", "showHiddenFiles"],
          title,
        });

        if (!result.canceled && result.filePaths.length)
          field.handleChange(result.filePaths[0]!);
      }

      setLoading(false);
      field.handleBlur();
    }, [field, setLoading, title, type]);

    const clearValue = useCallback(() => {
      field.handleChange("");
      field.handleBlur();
    }, [field]);

    return (
      <LabelContainer
        {...label}
        containerClassName={cn("w-full", label.containerClassName)}
        innerClassName={cn("relative", label.innerClassName)}
        errors={field.state.meta.errors}
        name={field.name}
      >
        <Button
          type="button"
          variant="secondary"
          className={cn(
            "border-input bg-card hover:bg-card justify-start pl-4 pr-9",
            className,
          )}
          innerClassName={cn(
            "truncate gap-3",
            !field.state.value
              ? "text-muted-foreground"
              : "[&>svg]:text-muted-foreground",
          )}
          ref={ref}
          value={field.state.value}
          onClick={onClickCallback}
          loading={loading}
          disabled={disabledContext || disabled}
        >
          {type === "directory" ? <FolderIcon /> : <FileIcon />}
          {field.state.value || placeholder}
        </Button>
        {field.state.value && (!disabledContext || disabled) ? (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground absolute bottom-0 right-0 flex size-11 items-center justify-center rounded-lg border-none outline-none transition-colors"
            onClick={clearValue}
            tabIndex={-1}
          >
            <TrashIcon className="size-4" />
          </button>
        ) : null}
      </LabelContainer>
    );
  },
);

Path.displayName = "Path";

export { Path };
