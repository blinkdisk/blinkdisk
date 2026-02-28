import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";
import { useAppForm } from "@hooks/use-app-form";
import { ZSftpConfig, ZSftpConfigType } from "@schemas/providers";

export function useSftpForm({
  action,
  config,
  onSubmit,
}: {
  action: VaultAction;
  config?: ZSftpConfigType;
  onSubmit: (value: ZSftpConfigType) => void;
}) {
  const { onSubmitAsync } = useConfigValidation("SFTP", action);

  return useAppForm({
    defaultValues: {
      host: "",
      user: "",
      port: 22,
      path: "",
      password: "",
      privateKey: "",
      knownHosts: "",
      ...config,
    } as ZSftpConfigType,
    validators: {
      onSubmit: ZSftpConfig,
      onSubmitAsync,
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });
}
