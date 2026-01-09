import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { AlertTriangleIcon } from "lucide-react";

export function IncorrectVaultError() {
  const { t } = useAppTranslation("vault.createDialog.config.incorrectError");

  return (
    <Alert variant="destructive">
      <AlertTitle>
        <AlertTriangleIcon className="mb-0.5 mr-2 inline-block size-3.5" />
        {t("title")}
      </AlertTitle>
      <AlertDescription className="text-xs">
        {t("description")}
      </AlertDescription>
    </Alert>
  );
}
