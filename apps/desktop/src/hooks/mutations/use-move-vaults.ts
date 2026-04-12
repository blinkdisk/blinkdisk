import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { getConfigCollection, getVaultCollection } from "@desktop/lib/db";
import { useMutation } from "@tanstack/react-query";
import { LOCAL_ACCOUNT_ID } from "libs/constants/src/account";

type MoveVaultsInput = {
  vaultIds: string[];
  toAccountId: string;
};

export function useMoveVaults({
  onSuccess,
}: { onSuccess?: (values: MoveVaultsInput) => void } = {}) {
  return useMutation({
    mutationKey: ["vault", "move"],
    mutationFn: async (values: MoveVaultsInput) => {
      const vaultQuery = {
        id: { $in: values.vaultIds },
      };

      const configQuery = {
        vaultId: { $in: values.vaultIds },
      };

      const vaults = getVaultCollection(LOCAL_ACCOUNT_ID)
        .find(vaultQuery)
        .fetch();

      const configs = getConfigCollection(LOCAL_ACCOUNT_ID)
        .find(configQuery)
        .fetch();

      getVaultCollection(values.toAccountId).insertMany(vaults);
      getConfigCollection(values.toAccountId).insertMany(configs);

      getVaultCollection(LOCAL_ACCOUNT_ID).removeMany(vaultQuery);
      getConfigCollection(LOCAL_ACCOUNT_ID).removeMany(configQuery);
    },
    onError: showErrorToast,
    onSuccess: async (_, values) => {
      onSuccess?.(values);
    },
  });
}
