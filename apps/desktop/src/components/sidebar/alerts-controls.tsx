import {
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@blinkdisk/ui/carousel";
import { useEffect, useState } from "react";

export function SidebarAlertsControls() {
  const { api } = useCarousel();
  const [currentAlert, setCurrentAlert] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!api) return;

    const updateCarouselState = () => {
      setScrollSnaps(api.scrollSnapList());
      setCurrentAlert(api.selectedScrollSnap());
    };

    updateCarouselState();
    api.on("select", updateCarouselState);
    api.on("reInit", updateCarouselState);

    return () => {
      api.off("select", updateCarouselState);
      api.off("reInit", updateCarouselState);
    };
  }, [api]);

  if (scrollSnaps.length <= 1) return null;
  if (!api) return null;

  return (
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
            onClick={() => api.scrollTo(index)}
            className={
              index === currentAlert
                ? "bg-foreground/70 size-1.5 rounded-full"
                : "bg-foreground/20 hover:bg-foreground/40 size-1.5 rounded-full transition-colors"
            }
          />
        ))}
      </div>
    </div>
  );
}
