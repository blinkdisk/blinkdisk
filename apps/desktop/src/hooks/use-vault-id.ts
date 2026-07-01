import { useNavigate, useParams } from "@tanstack/react-router";

export function useVaultId() {
  const navigate = useNavigate({ from: "/$accountId" });
  const { accountId, vaultId } = useParams({ strict: false });

  const changeVault = (id: string) => {
    if (!accountId) return;

    navigate({
      to: "/$accountId/$vaultId",
      params: (params) => ({
        ...params,
        vaultId: id,
      }),
    });
  };

  return { vaultId, changeVault };
}
