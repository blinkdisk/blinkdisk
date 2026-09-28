import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
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
        <p
          style={{
            overflowWrap: "anywhere",
          }}
          className="whitespace-pre-wrap text-sm"
        >
          {message}
        </p>
      </AlertDescription>
    </Alert>
  );
}
