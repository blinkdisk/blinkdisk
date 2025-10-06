"use client";

import { useAppTranslation } from "@hooks/use-app-translation";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@utils/class";
import { TriangleAlertIcon } from "lucide-react";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export type LabelContainerProps = {
  labelClassName?: string;
  containerClassName?: string;
  innerClassName?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  name?: string;
  children?: React.ReactNode;
  errors?: {
    type?: string;
    validation?: string;
    code?: string;
    path?: string;
    message?: string;
  }[];
  end?: React.ReactNode;
  optional?: boolean;
  required?: boolean;
};

const LabelContainer = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelContainerProps
>(
  (
    {
      errors,
      children,
      title,
      description,
      labelClassName,
      innerClassName,
      containerClassName,
      optional,
      required,
      name,
      end,
    },
    ref,
  ) => {
    const { t } = useAppTranslation("validation");

    return (
      <div className={cn("flex flex-col gap-y-2", containerClassName)}>
        <div className={cn("flex flex-col gap-y-2", innerClassName)}>
          {title || end ? (
            <div className="flex items-end justify-between">
              {title || description ? (
                <div>
                  {title ? (
                    <Label
                      htmlFor={name}
                      className={cn(labelClassName)}
                      ref={ref}
                    >
                      {title}
                      {required ? (
                        <span className="text-primary ml-1">*</span>
                      ) : null}
                    </Label>
                  ) : null}
                  {description ? (
                    <p className="text-muted-foreground text-xs">
                      {description}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {end ? (
                end
              ) : optional ? (
                <p className="text-primary text-xs">{t("optional")}</p>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
        {errors && errors.length > 0 ? (
          <div className="flex flex-col gap-y-2">
            {errors.flat().map((error, index) => (
              <div key={index} className="text-destructive text-xs">
                <TriangleAlertIcon className="mb-0.25 mr-1.5 inline-block size-3.5" />
                {t(
                  `validation:${error.type || error.validation || error.message}_${error.code}`,
                  {
                    ...error,
                    field:
                      title && typeof title === "string"
                        ? title
                        : name || error.path || "",
                  },
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  },
);
LabelContainer.displayName = LabelPrimitive.Root.displayName;

export { Label, LabelContainer };
