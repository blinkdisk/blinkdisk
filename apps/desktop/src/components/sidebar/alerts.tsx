import { getStorageProvider } from "@blinkdisk/constants/providers";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@blinkdisk/ui/carousel";
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
import { useOffline } from "@desktop/hooks/use-offline";
import AutoHeight from "embla-carousel-auto-height";
import { type ReactNode, useEffect, useState } from "react";

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
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentAlert, setCurrentAlert] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const storagePercentage = space ? space.used / space.capacity : 0;
  const onlyLocalVaults =
    !!vaults?.length &&
    vaults.every((vault) => {
      const provider = getStorageProvider(vault.provider);

      return provider?.local;
    });

  const showReviewAlert =
    !reviewDismissedAt &&
    !!vault?.createdAt &&
    Date.now() - new Date(vault.createdAt).getTime() >
      REVIEW_ALERT_VAULT_AGE_MS;

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

  if (space?.trialEndsAt) {
    alerts.push({
      key: "trial",
      alert: (
        <SidebarTrialAlert
          capacity={space.capacity}
          trialEndsAt={space.trialEndsAt}
        />
      ),
    });
  }

  if (storagePercentage >= 0.8) {
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

  useEffect(() => {
    if (!carouselApi) return;

    const updateCarouselState = () => {
      setScrollSnaps(carouselApi.scrollSnapList());
      setCurrentAlert(carouselApi.selectedScrollSnap());
    };

    updateCarouselState();
    carouselApi.on("select", updateCarouselState);
    carouselApi.on("reInit", updateCarouselState);

    return () => {
      carouselApi.off("select", updateCarouselState);
      carouselApi.off("reInit", updateCarouselState);
    };
  }, [carouselApi]);

  if (!alerts.length) return null;

  return (
    <Carousel
      opts={{ align: "start", loop: true }}
      plugins={[AutoHeight()]}
      setApi={setCarouselApi}
      className="group/alerts"
    >
      <CarouselContent className="-ml-2 items-start transition-[height]">
        {alerts.map(({ alert, key }) => (
          <CarouselItem key={key} className="pl-2">
            {alert}
          </CarouselItem>
        ))}
      </CarouselContent>
      {scrollSnaps.length > 1 ? (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-0.5">
            <CarouselPrevious
              variant="ghost"
              className="text-muted-foreground static size-6 translate-y-0"
            />
            <CarouselNext
              variant="ghost"
              className="text-muted-foreground static size-6 translate-y-0"
            />
          </div>
          <div className="flex gap-1.5">
            {scrollSnaps.map((scrollSnap, index) => (
              <button
                key={scrollSnap}
                type="button"
                aria-label={`Go to alert ${index + 1}`}
                aria-current={index === currentAlert ? "true" : undefined}
                onClick={() => carouselApi?.scrollTo(index)}
                className={
                  index === currentAlert
                    ? "bg-foreground/70 size-1.5 rounded-full"
                    : "bg-foreground/20 hover:bg-foreground/40 size-1.5 rounded-full transition-colors"
                }
              />
            ))}
          </div>
        </div>
      ) : null}
    </Carousel>
  );
}
