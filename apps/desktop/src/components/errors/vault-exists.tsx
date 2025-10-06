import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { AlertTriangleIcon } from "lucide-react";

type VaultExistsErrorProps = {
  code?: string;
};

export function VaultExistsError({ code }: VaultExistsErrorProps) {
  const { t } = useAppTranslation("vault.createDialog.config.existsError");

  return (
    <Alert variant="destructive">
      <AlertTitle>
        <AlertTriangleIcon className="mb-0.5 mr-2 inline-block size-3.5" />
        {t(
          `vault:createDialog.config.${code === "STORAGE_ALREADY_EXISTS" ? "existsError" : "notFoundError"}.title`,
        )}
      </AlertTitle>
      <AlertDescription className="text-xs">
        {t(
          `vault:createDialog.config.${code === "STORAGE_ALREADY_EXISTS" ? "existsError" : "notFoundError"}.description`,
        )}
      </AlertDescription>
    </Alert>
  );
}
