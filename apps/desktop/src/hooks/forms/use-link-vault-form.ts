import {
  LinkVaultResponse,
  useLinkVault,
} from "@desktop/hooks/mutations/use-link-vault";
import { UnlinkedVaultItem } from "@desktop/hooks/queries/use-unlinked-vaults";
import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useAppForm } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ProviderConfig } from "@schemas/providers";
import { ZLinkVaultDetails } from "@schemas/vault";
import { useNavigate } from "@tanstack/react-router";

export function useLinkVaultForm({
  vault,
  password,
  onSuccess,
  config,
}: {
  vault: UnlinkedVaultItem | undefined;
  password: string | undefined;
  onSuccess?: (res: LinkVaultResponse) => void;
  config?: ProviderConfig;
}) {
  const { t } = useAppTranslation("vault.providers");
  const navigate = useNavigate();

  const { profileId } = useProfile();
  const { deviceId } = useDevice();

  const { mutateAsync } = useLinkVault(async (res) => {
    form.reset();

    await navigate({
      to: "/app/{-$deviceId}/{-$profileId}/{-$vaultId}",
      params: {
        profileId,
        deviceId,
        vaultId: res.vaultId,
      },
    });

    onSuccess?.(res);
  });

  const form = useAppForm({
    defaultValues: {
      name: vault ? vault.name || t(`${vault.provider}.name`) : "",
    },
    validators: {
      onSubmit: ZLinkVaultDetails,
    },
    onSubmit: async ({ value }) =>
      vault &&
      password &&
      profileId &&
      deviceId &&
      (await mutateAsync({
        deviceId: deviceId,
        profileId: profileId,
        storageId: vault.storageId,
        name: value.name,
        password: password,
        source: {
          profileId: vault.profileId,
          deviceId: vault.deviceId,
        },
        ...(config && { config }),
      })),
  });

  return form;
}
