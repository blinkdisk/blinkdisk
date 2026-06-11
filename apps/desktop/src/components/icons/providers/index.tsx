import { AmazonS3Icon } from "@desktop/components/icons/providers/amazon-s3";
import { AzureBlobStorageIcon } from "@desktop/components/icons/providers/azure-blob-storage";
import { BackblazeIcon } from "@desktop/components/icons/providers/backblaze";
import { CloudBlinkIcon } from "@desktop/components/icons/providers/cloudblink";
import { ExternalDriveIcon } from "@desktop/components/icons/providers/external-drive";
import { GoogleCloudStorageIcon } from "@desktop/components/icons/providers/google-cloud-storage";
import { InternalDriveIcon } from "@desktop/components/icons/providers/internal-drive";
import { NetworkDriveIcon } from "@desktop/components/icons/providers/network-drive";
import { RcloneIcon } from "@desktop/components/icons/providers/rclone";
import { S3CompatibleIcon } from "@desktop/components/icons/providers/s3-compatible";
import { SftpIcon } from "@desktop/components/icons/providers/sftp";
import { WebdavIcon } from "@desktop/components/icons/providers/webdav";

export const providerIcons = {
  CLOUDBLINK: CloudBlinkIcon,
  INTERNAL_DRIVE: InternalDriveIcon,
  EXTERNAL_DRIVE: ExternalDriveIcon,
  NETWORK_DRIVE: NetworkDriveIcon,
  FILESYSTEM: InternalDriveIcon,
  AMAZON_S3: AmazonS3Icon,
  AZURE_BLOB_STORAGE: AzureBlobStorageIcon,
  BACKBLAZE: BackblazeIcon,
  GOOGLE_CLOUD_STORAGE: GoogleCloudStorageIcon,
  NETWORK_ATTACHED_STORAGE: NetworkDriveIcon,
  RCLONE: RcloneIcon,
  S3_COMPATIBLE: S3CompatibleIcon,
  SFTP: SftpIcon,
  WEBDAV: WebdavIcon,
};
