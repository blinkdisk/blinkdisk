import VaultIcon from "@desktop/components/icons/vault";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useTaskDialog } from "@desktop/hooks/state/use-task-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";

export function VaultStarting() {
  const { t } = useAppTranslation("vault.starting");
  const { initTask } = useVaultStatus();
  const { openTaskDialog } = useTaskDialog();

  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto py-12">
      <div className="mt-auto"></div>
      <div className="flex flex-col items-center justify-center">
        <VaultIcon className="size-28" />
        <h1 className="mt-8 text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-4 max-w-72 text-center">
          {t("description")}
        </p>
        {initTask && (
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => openTaskDialog({ taskId: initTask })}
          >
            Show Logs
          </Button>
        )}
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
