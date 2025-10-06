import { authClient } from "@desktop/lib/auth";
import { useAppStorage } from "@hooks/use-app-storage";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function useAccount(options?: { enabled: boolean }) {
  const navigate = useNavigate();

  const [, setAuthenticated] = useAppStorage("authenticated", false);

  return useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const { data, error } = await authClient.getSession();

      if (error) throw error;
      if (data === null) {
        setAuthenticated(false);
        await navigate({ to: "/auth/login" });
      }

      return data;
    },
    enabled: options?.enabled,
  });
}
