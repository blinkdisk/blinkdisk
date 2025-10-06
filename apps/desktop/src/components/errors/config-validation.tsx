import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { AlertTriangleIcon } from "lucide-react";

type ConfigValidationErrorProps = {
  message?: string;
};

export function ConfigValidationError({ message }: ConfigValidationErrorProps) {
  const { t } = useAppTranslation("vault.createDialog.config.validationError");

  return (
    <Alert variant="destructive">
      <AlertTitle>
        <AlertTriangleIcon className="mb-0.5 mr-2 inline-block size-3.5" />
        {t("title")}
      </AlertTitle>
      <AlertDescription className="mt-1">
        <code
          style={{
            overflowWrap: "anywhere",
          }}
          className="bg-destructive/5 border-destructive/30 w-full whitespace-pre-wrap rounded border px-2.5 py-1.5 text-xs"
        >
          {message}
        </code>
      </AlertDescription>
    </Alert>
  );
}
