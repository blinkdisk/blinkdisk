import { useSubscription } from "@desktop/hooks/queries/use-subscription";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui/dialog";

type PendingCheckoutDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  url?: string;
};

export function PendingCheckoutDialog({
  isOpen,
  setIsOpen,
  url,
}: PendingCheckoutDialogProps) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("subscription.pendingCheckoutDialog");
  const { isFetching } = useSubscription();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-100 block max-h-[80v]">
        <div className="flex flex-col items-center justify-between py-10">
          <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
          <DialogDescription className="px-4 text-center">
            {t("description")}
          </DialogDescription>
        </div>
        <Button
          onClick={() => url && window.electron.shell.open.browser(url)}
          disabled={!url}
          className="w-full"
          variant="outline"
        >
          {t("open")}
        </Button>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[1] === "subscription",
            })
          }
          loading={isFetching}
          className="mt-4 w-full"
        >
          {t("check")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
