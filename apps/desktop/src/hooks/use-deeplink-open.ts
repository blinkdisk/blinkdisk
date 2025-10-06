import { usePlanChange } from "@desktop/hooks/use-plan-change";
import type { IpcRendererEvent } from "electron";
import { useEffect } from "react";

export function useDeeplinkOpen() {
  const { onPlanChange } = usePlanChange();

  useEffect(() => {
    const handler = async (
      _: IpcRendererEvent,
      payload: {
        event: string;
      },
    ) => {
      switch (payload.event) {
        case "checkout_completed":
          onPlanChange();
          break;
      }
    };

    window.electron.deeplink.open.on(handler);

    return () => {
      window.electron.deeplink.open.off(handler);
    };
  }, [onPlanChange]);
}
