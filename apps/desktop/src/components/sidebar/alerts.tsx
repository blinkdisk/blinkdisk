import { getStorageProvider } from "@blinkdisk/constants/providers";
import { STORAGE_USAGE_WARNING_THRESHOLD } from "@blinkdisk/constants/space";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@blinkdisk/ui/carousel";
import { SidebarAlertsControls } from "@desktop/components/sidebar/alerts-controls";
import { SidebarLocalOnlyAlert } from "@desktop/components/sidebar/local-only-alert";
import { SidebarOfflineAlert } from "@desktop/components/sidebar/offline-alert";
import { SidebarReviewAlert } from "@desktop/components/sidebar/review-alert";
import { SidebarStorageAlert } from "@desktop/components/sidebar/storage-alert";
import { SidebarTrialAlert } from "@desktop/components/sidebar/trial-alert";
import { SidebarUpdateAlert } from "@desktop/components/sidebar/update-alert";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultList } from "@desktop/hooks/queries/use-vault-list";
import { useUpdateDialog } from "@desktop/hooks/state/use-update-dialog";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useNow } from "@desktop/hooks/use-now";
import { useOffline } from "@desktop/hooks/use-offline";
import AutoHeight from "embla-carousel-auto-height";
import type { ReactNode } from "react";

const REVIEW_ALERT_VAULT_AGE_MS = 12 * 60 * 60 * 1000;

type SidebarAlertSlide = {
  key: string;
  alert: ReactNode;
};

export function SidebarAlerts() {
  const { isOffline } = useOffline();
  const { data: space } = useSpace();
  const { data: vault } = useVault();
  const { data: vaults } = useVaultList();
  const { status } = useUpdateDialog();
  const [reviewDismissedAt] = useAppStorage("sidebarAlerts.dismissed.review");
  const [cloudBackupDismissedAt] = useAppStorage(
    "sidebarAlerts.dismissed.cloudBackup",
  );
  const now = useNow();

  const storagePercentage = space
    ? space.capacity === 0
      ? 1
      : Math.min(space.used / space.capacity, 1)
    : 0;
  const onlyLocalVaults =
    !!vaults?.length &&
    vaults.every((vault) => {
      const provider = getStorageProvider(vault.provider);

      return provider?.local;
    });

  const showReviewAlert =
    !reviewDismissedAt &&
    !!vault?.createdAt &&
    now - new Date(vault.createdAt).getTime() > REVIEW_ALERT_VAULT_AGE_MS;

  const alerts: SidebarAlertSlide[] = [];

  if (status?.available) {
    alerts.push({
      key: "update",
      alert: <SidebarUpdateAlert />,
    });
  }

  if (isOffline) {
    alerts.push({
      key: "offline",
      alert: <SidebarOfflineAlert />,
    });
  }

  if (onlyLocalVaults && !cloudBackupDismissedAt) {
    alerts.push({
      key: "local-vaults",
      alert: <SidebarLocalOnlyAlert />,
    });
  }

  if (space?.trialStartedAt && space.trialEndsAt) {
    alerts.push({
      key: "trial",
      alert: (
        <SidebarTrialAlert
          capacity={space.capacity}
          trialStartedAt={space.trialStartedAt}
          trialEndsAt={space.trialEndsAt}
        />
      ),
    });
  }

  if (storagePercentage >= STORAGE_USAGE_WARNING_THRESHOLD) {
    alerts.push({
      key: "storage",
      alert: <SidebarStorageAlert />,
    });
  }

  if (showReviewAlert) {
    alerts.push({
      key: "review",
      alert: <SidebarReviewAlert />,
    });
  }

  if (!alerts.length) return null;

  return (
    <Carousel
      opts={{ align: "start", loop: true }}
      plugins={[AutoHeight()]}
      className="group/alerts"
    >
      <CarouselContent className="-ml-2 items-start transition-[height]">
        {alerts.map(({ alert, key }) => (
          <CarouselItem key={key} className="pl-2">
            {alert}
          </CarouselItem>
        ))}
      </CarouselContent>
      <SidebarAlertsControls />
    </Carousel>
  );
}
