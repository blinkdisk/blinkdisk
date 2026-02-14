import { AmazonS3Icon } from "@desktop/components/icons/providers/amazon-s3";
import { AzureBlobStorageIcon } from "@desktop/components/icons/providers/azure-blob-storage";
import { BackblazeIcon } from "@desktop/components/icons/providers/backblaze";
import { BlinkCloudIcon } from "@desktop/components/icons/providers/blinkcloud";
import { FilesystemIcon } from "@desktop/components/icons/providers/filesytem";
import { GoogleCloudStorageIcon } from "@desktop/components/icons/providers/google-cloud-storage";
import { NetworkAttachedStorageIcon } from "@desktop/components/icons/providers/network-attached-storage";
import { RcloneIcon } from "@desktop/components/icons/providers/rclone";
import { S3CompatibleIcon } from "@desktop/components/icons/providers/s3-compatible";
import { SftpIcon } from "@desktop/components/icons/providers/sftp";
import { WebdavIcon } from "@desktop/components/icons/providers/webdav";

export const providerIcons = {
  BLINKCLOUD: () => null,
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
