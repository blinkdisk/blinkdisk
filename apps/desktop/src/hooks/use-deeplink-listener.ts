import { usePlanChange } from "@desktop/hooks/use-plan-change";
import { useEffect } from "react";

export function useDeeplinkListener() {
  const { onPlanChange } = usePlanChange();

  useEffect(() => {
    return window.electron.deeplink.open(async (payload: { event: string }) => {
      switch (payload.event) {
        case "checkout_completed":
          onPlanChange();
          break;
      }
    });
  }, [onPlanChange]);
}
