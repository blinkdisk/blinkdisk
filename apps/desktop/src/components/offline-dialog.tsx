import { Empty } from "@desktop/components/empty";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Dialog, DialogContent } from "@ui/dialog";
import { WifiOffIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineDialog() {
  const { t } = useAppTranslation("error.offline");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Dialog open={isOffline} onOpenChange={() => {}}>
      <DialogContent className="max-w-md py-16" showCloseButton={false}>
        <Empty
          icon={<WifiOffIcon />}
          title={t("title")}
          description={t("description")}
        />
      </DialogContent>
    </Dialog>
  );
}
