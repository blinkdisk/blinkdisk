import { useAppStorage } from "@hooks/use-app-storage";

export function useAccountId() {
  const [accountId, setAccountId] = useAppStorage("currentAccountId");
  return { accountId, setAccountId };
}
