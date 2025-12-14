import { useAppStorage } from "@desktop/hooks/use-app-storage";

export function useAccountId() {
  const [accountId, setAccountId] = useAppStorage("currentAccountId");
  return { accountId, setAccountId };
}
