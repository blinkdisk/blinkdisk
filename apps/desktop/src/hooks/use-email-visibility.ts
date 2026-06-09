import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useCallback } from "react";

export function useEmailVisibility() {
  const [hideEmail, setHideEmail] = useAppStorage(
    "preferences.hideEmail",
    false,
  );

  const isEmailVisible = !hideEmail;

  const setEmailVisible = useCallback(
    async (to: boolean) => {
      await setHideEmail(!to);
    },
    [setHideEmail],
  );

  const toggleEmailVisibility = useCallback(async () => {
    await setEmailVisible(!isEmailVisible);
  }, [isEmailVisible, setEmailVisible]);

  return {
    isEmailVisible,
    setEmailVisible,
    toggleEmailVisibility,
  };
}
