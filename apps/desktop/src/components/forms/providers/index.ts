import { AmazonS3Form } from "#components/forms/providers/amazon-s3";
import { AzureBlobStorageForm } from "#components/forms/providers/azure-blob-storage";
import { BackblazeForm } from "#components/forms/providers/backblaze";
import { FilesystemForm } from "#components/forms/providers/filesystem";
import { GoogleCloudStorageForm } from "#components/forms/providers/google-cloud-storage";
import { NetworkAttachedStorageForm } from "#components/forms/providers/network-attached-storage";
import { RcloneForm } from "#components/forms/providers/rclone";
import { S3CompatibleForm } from "#components/forms/providers/s3-compatible";
import { SftpForm } from "#components/forms/providers/sftp";
import { WebDavForm } from "#components/forms/providers/webdav";

export const providerForms = {
  CLOUDBLINK: () => null,
  FILESYSTEM: FilesystemForm,
  NETWORK_ATTACHED_STORAGE: NetworkAttachedStorageForm,
  AMAZON_S3: AmazonS3Form,
  AZURE_BLOB_STORAGE: AzureBlobStorageForm,
  BACKBLAZE: BackblazeForm,
  GOOGLE_CLOUD_STORAGE: GoogleCloudStorageForm,
  RCLONE: RcloneForm,
  S3_COMPATIBLE: S3CompatibleForm,
  SFTP: SftpForm,
  WEBDAV: WebDavForm,
};
