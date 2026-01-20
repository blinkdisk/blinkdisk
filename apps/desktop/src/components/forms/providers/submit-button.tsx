import { VaultAction } from "@desktop/hooks/use-config-validation";
import { useAppTranslation } from "@hooks/use-app-translation";

interface FormProps {
  AppForm: React.ComponentType<{ children: React.ReactNode }>;
  Submit: React.ComponentType<{
    className?: string;
    children: React.ReactNode;
  }>;
}

export type ProviderSubmitButtonProps = {
  action: VaultAction;
  form: FormProps;
};

export function ProviderSubmitButton({
  action,
  form,
}: ProviderSubmitButtonProps) {
  const { t } = useAppTranslation("vault");

  if (action === "UPDATE") {
    return null;
  }

  return (
    <form.AppForm>
      <form.Submit className="mt-2">
        {t("createDialog.config.submit")}
      </form.Submit>
    </form.AppForm>
  );
}
