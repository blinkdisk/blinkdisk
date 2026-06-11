import {
  LocalFilesystemForm,
  type LocalFilesystemFormProps,
} from "@desktop/components/forms/providers/local-filesystem";

export type NetworkDriveFormProps = Omit<
  LocalFilesystemFormProps,
  "providerType"
>;

export function NetworkDriveForm(props: NetworkDriveFormProps) {
  return <LocalFilesystemForm {...props} providerType="NETWORK_DRIVE" />;
}
