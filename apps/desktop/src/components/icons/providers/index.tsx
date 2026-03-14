import { AmazonS3Icon } from "#components/icons/providers/amazon-s3";
import { AzureBlobStorageIcon } from "#components/icons/providers/azure-blob-storage";
import { BackblazeIcon } from "#components/icons/providers/backblaze";
import { FilesystemIcon } from "#components/icons/providers/filesytem";
import { GoogleCloudStorageIcon } from "#components/icons/providers/google-cloud-storage";
import { NetworkAttachedStorageIcon } from "#components/icons/providers/network-attached-storage";
import { RcloneIcon } from "#components/icons/providers/rclone";
import { S3CompatibleIcon } from "#components/icons/providers/s3-compatible";
import { SftpIcon } from "#components/icons/providers/sftp";
import { WebdavIcon } from "#components/icons/providers/webdav";

export const providerIcons = {
  CLOUDBLINK: () => null,
  FILESYSTEM: FilesystemIcon,
  AMAZON_S3: AmazonS3Icon,
  AZURE_BLOB_STORAGE: AzureBlobStorageIcon,
  BACKBLAZE: BackblazeIcon,
  GOOGLE_CLOUD_STORAGE: GoogleCloudStorageIcon,
  NETWORK_ATTACHED_STORAGE: NetworkAttachedStorageIcon,
  RCLONE: RcloneIcon,
  S3_COMPATIBLE: S3CompatibleIcon,
  SFTP: SftpIcon,
  WEBDAV: WebdavIcon,
};
