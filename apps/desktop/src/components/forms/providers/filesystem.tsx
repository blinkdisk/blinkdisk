import {
  LocalFilesystemForm,
  type LocalFilesystemFormProps,
} from "@desktop/components/forms/providers/local-filesystem";

export type DriveFormProps = Omit<LocalFilesystemFormProps, "providerType">;

export function InternalDriveForm(props: DriveFormProps) {
  return <LocalFilesystemForm {...props} providerType="INTERNAL_DRIVE" />;
}

export function ExternalDriveForm(props: DriveFormProps) {
  return <LocalFilesystemForm {...props} providerType="EXTERNAL_DRIVE" />;
}
