import { useLinkVaultForm } from "@desktop/hooks/forms/use-link-vault-form";
import { UnlinkedVaultItem } from "@desktop/hooks/queries/use-unlinked-vaults";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ProviderConfig } from "@schemas/providers";
import { useNavigate } from "@tanstack/react-router";

type LinkVaultDetailsProps = {
  vault: UnlinkedVaultItem | undefined;
  password: string | undefined;
  config: ProviderConfig | undefined;
  onSubmit?: () => void;
};

export function LinkVaultDetails({
  vault,
  password,
  onSubmit,
  config,
}: LinkVaultDetailsProps) {
  const { t } = useAppTranslation("vault.linkDialog.details");
  const navigate = useNavigate();

  const form = useLinkVaultForm({
    vault,
    config,
    password,
    onSuccess: async (res) => {
      await navigate({
        to: "/app/{-$deviceId}/{-$profileId}/{-$vaultId}",
        params: (params) => ({
          ...params,
          vaultId: res.vaultId,
        }),
      });

      onSubmit?.();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
      className="mt-8 flex flex-col gap-6"
    >
      <form.AppField name="name">
        {(field) => (
          <field.Text
            label={{ title: t("name.label"), required: true }}
            placeholder={t("name.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.Submit>{t("submit")}</form.Submit>
      </form.AppForm>
    </form>
  );
}
