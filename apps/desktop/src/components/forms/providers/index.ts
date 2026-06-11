import { AmazonS3Form } from "@desktop/components/forms/providers/amazon-s3";
import { AzureBlobStorageForm } from "@desktop/components/forms/providers/azure-blob-storage";
import { BackblazeForm } from "@desktop/components/forms/providers/backblaze";
import {
  ExternalDriveForm,
  InternalDriveForm,
} from "@desktop/components/forms/providers/filesystem";
import { GoogleCloudStorageForm } from "@desktop/components/forms/providers/google-cloud-storage";
import { NetworkDriveForm } from "@desktop/components/forms/providers/network-attached-storage";
import { RcloneForm } from "@desktop/components/forms/providers/rclone";
import { S3CompatibleForm } from "@desktop/components/forms/providers/s3-compatible";
import { SftpForm } from "@desktop/components/forms/providers/sftp";
import { WebDavForm } from "@desktop/components/forms/providers/webdav";

export const providerForms = {
  CLOUDBLINK: () => null,
  INTERNAL_DRIVE: InternalDriveForm,
  EXTERNAL_DRIVE: ExternalDriveForm,
  NETWORK_DRIVE: NetworkDriveForm,
  FILESYSTEM: InternalDriveForm,
  NETWORK_ATTACHED_STORAGE: NetworkDriveForm,
  AMAZON_S3: AmazonS3Form,
  AZURE_BLOB_STORAGE: AzureBlobStorageForm,
  BACKBLAZE: BackblazeForm,
  GOOGLE_CLOUD_STORAGE: GoogleCloudStorageForm,
  RCLONE: RcloneForm,
  S3_COMPATIBLE: S3CompatibleForm,
  SFTP: SftpForm,
  WEBDAV: WebDavForm,
};
