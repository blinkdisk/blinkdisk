import { useAppStorage } from "@desktop/hooks/use-app-storage";

export function useEmailVisibility() {
  const [hideEmail, setHideEmail] = useAppStorage(
    "preferences.hideEmail",
    false,
  );

  const isEmailVisible = !hideEmail;

  const setEmailVisible = async (to: boolean) => {
    await setHideEmail(!to);
  };

  const toggleEmailVisibility = async () => {
    await setEmailVisible(!isEmailVisible);
  };

  return {
    isEmailVisible,
    setEmailVisible,
    toggleEmailVisibility,
  };
}
