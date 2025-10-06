import { useProfile } from "@desktop/hooks/use-profile";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { LockIcon } from "lucide-react";

export function ReadOnlyAlert() {
  const { t } = useAppTranslation("vault.readOnly");
  const { readOnly } = useProfile();

  if (!readOnly) return null;
  return (
    <Alert variant="info">
      <AlertTitle>
        <LockIcon className="mr-1.5 inline-block size-4" />
        {t("title")}
      </AlertTitle>
      <AlertDescription>{t("description")}</AlertDescription>
    </Alert>
  );
}
