import { useAppTranslation } from "@hooks/use-app-translation";
import { cn } from "@utils/class";
import { useMemo } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";

export type DynamicFieldProps = {
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
    translated?: boolean;
  }[];
  end?: React.ReactNode;
  required?: boolean;
  labelClassName?: string;
  containerClassName?: string;
  innerClassName?: string;
};

export function DynamicField({
  errors,
  children,
  description,
  end,
  innerClassName,
  containerClassName,
  ...props
}: DynamicFieldProps) {
  const { t } = useAppTranslation("validation");

  const errorMessages = useMemo(() => {
    return errors?.flat().map(({ translated, ...error }) =>
      translated
        ? error.message
        : t(
            `validation:${error.type || error.validation || error.message}_${error.code}`,
            {
              ...error,
              field:
                props.title && typeof props.title === "string"
                  ? props.title
                  : props.name || error.path || "",
            },
          ),
    );
  }, [errors, props, t]);

  return (
    <Field className={containerClassName}>
      <div className={cn("flex flex-col gap-1", innerClassName)}>
        {end ? (
          <div className="flex items-end">
            <Label {...props} />
            {end}
          </div>
        ) : (
          <Label {...props} />
        )}
        {description && <FieldDescription>{description}</FieldDescription>}
        {children}
      </div>
      {errorMessages?.length ? (
        <FieldError errors={errorMessages.map((message) => ({ message }))} />
      ) : null}
    </Field>
  );
}

function Label({
  name,
  title,
  required,
  labelClassName,
}: Pick<DynamicFieldProps, "name" | "title" | "required" | "labelClassName">) {
  return (
    <FieldLabel htmlFor={name} className={labelClassName}>
      {title}
      {required ? <span className="text-primary ml-1">*</span> : null}
    </FieldLabel>
  );
}
