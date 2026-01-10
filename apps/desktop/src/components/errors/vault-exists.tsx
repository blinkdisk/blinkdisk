import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { AlertTriangleIcon } from "lucide-react";

type VaultExistsErrorProps = {
  name?: string;
};

export function VaultExistsError({ name }: VaultExistsErrorProps) {
  const { t } = useAppTranslation("vault.createDialog.config.existsError");

  return (
    <Alert variant="destructive">
      <AlertTitle>
        <AlertTriangleIcon className="mb-0.5 mr-2 inline-block size-3.5" />
        {t("title")}
      </AlertTitle>
      <AlertDescription className="text-xs">
        {t("description", { name: name || "Unknown" })}
      </AlertDescription>
    </Alert>
  );
}
