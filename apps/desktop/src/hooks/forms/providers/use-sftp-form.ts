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
  coreId,
}: {
  action: VaultAction;
  config?: ZSftpConfigType;
  onSubmit: (value: ZSftpConfigType) => void;
  coreId?: string;
}) {
  const { onSubmitAsync } = useConfigValidation("SFTP", action, coreId);

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
