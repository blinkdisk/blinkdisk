export type SupportedValue = {
  supported: boolean | "partial";
  note?: string;
  source?: string;
};

export type TextValue = {
  text: string;
  note?: string;
  source?: string;
};

export type CellValue = SupportedValue | TextValue | null ;

export type BackupTool = {
  slug: string;
  name: string;
  website: string;
  pricingUrl?: string;
  general: {
    folderBackups: CellValue;
    imageBackups: CellValue;
    openSource: CellValue;
    releaseYear: CellValue;
  };
  features: {
    deduplication: CellValue;
    compression: CellValue;
    versioning: CellValue;
    scheduling: CellValue;
  };
  privacy: {
    endToEndEncryption: CellValue;
    zeroKnowledge: CellValue;
  };
  platforms: {
    windows: CellValue;
    macos: CellValue;
    linux: CellValue;
    android: CellValue;
    ios: CellValue;
  };
  storages: {
    managedCloud: CellValue;
    localFilesystem: CellValue;
    nas: CellValue;
    s3Compatible: CellValue;
    sftp: CellValue;
    webdav: CellValue;
    rclone: CellValue;
  };
};

export type LabelConfig = {
  text: string;
  link?: string;
  description?: string;
  icon?: string;
  srText?: {
    true: string;
    false: string;
    partial: string;
  };
};

export const generalLabels: Record<keyof BackupTool["general"], LabelConfig> = {
  folderBackups: { text: "File/Folder Backups" },
  imageBackups: { text: "Disk Image Backups" },
  openSource: { text: "Open Source", srText: { true: "Yes", false: "No", partial: "Partially" } },
  releaseYear: { text: "Release Year" },
};

export const featureLabels: Record<keyof BackupTool["features"], LabelConfig> = {
  deduplication: { text: "Deduplication", link: "/glossary/what-is-deduplication-in-backups", description: "Avoids storing duplicate data" },
  compression: { text: "Compression", link: "/glossary/what-is-compression-in-backups", description: "Reduces backup size" },
  versioning: { text: "Version History", description: "Access previous file versions" },
  scheduling: { text: "Scheduled Backups", description: "Automatic backups on a schedule" },
};

export const privacyLabels: Record<keyof BackupTool["privacy"], LabelConfig> = {
  endToEndEncryption: { text: "End-to-End Encryption", link: "/glossary/what-is-end-to-end-encryption-in-backups", description: "Encrypted on your device" },
  zeroKnowledge: { text: "Zero-Knowledge", description: "Provider doesn't hold the keys" },
};

export const platformLabels: Record<keyof BackupTool["platforms"], LabelConfig> = {
  windows: { text: "Windows", icon: "windows" },
  macos: { text: "macOS", icon: "apple" },
  linux: { text: "Linux", icon: "linux" },
  android: { text: "Android", icon: "android" },
  ios: { text: "iOS", icon: "apple" },
};

export const storageLabels: Record<keyof BackupTool["storages"], LabelConfig> = {
  managedCloud: { text: "Managed Cloud", link: "/glossary/what-is-cloud-backup", description: "Provider's own cloud storage" },
  localFilesystem: { text: "Local Filesystem", link: "/glossary/what-is-a-local-backup", description: "External drives, USB, etc." },
  nas: { text: "Network Attached Storage", description: "Backup to NAS devices" },
  s3Compatible: { text: "S3-Compatible Storage", description: "AWS S3, Backblaze B2, etc." },
  sftp: { text: "SFTP", description: "Secure file transfer protocol" },
  webdav: { text: "WebDAV", description: "Web-based file access" },
  rclone: { text: "Rclone Remotes", description: "50+ cloud providers via Rclone" },
};

export function getComparisionSitemap(baseUrl: string) {
  const paths: string[] = [];

  for (const tool of allTools) {
    paths.push(`/compare/${tool.slug}-vs-blinkdisk`);
  }

  for (let i = 0; i < allTools.length; i++) {
    for (let j = i + 1; j < allTools.length; j++) {
      const [first, second] = [allTools[i], allTools[j]].sort((a, b) => a?.slug.localeCompare(b?.slug || "") || 0);
      paths.push(`/compare/${first?.slug}-vs-${second?.slug}-vs-blinkdisk`);
    }
  }

  return paths.map((path) => `${baseUrl}${path}`);
}

export const allTools: BackupTool[] = [
  {
    slug: "blinkdisk",
    name: "BlinkDisk",
    website: "https://blinkdisk.com?utm_source=compare",
    pricingUrl: "/cloudblink#pricing",
    general: {
      releaseYear: { text: "2025", note: "Built on Kopia, released in 2021" },
      folderBackups: { supported: true },
      imageBackups: { supported: false },
      openSource: { supported: true },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    privacy: {
      endToEndEncryption: { supported: true },
      zeroKnowledge: { supported: true },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: true },
      linux: { supported: true },
      android: { supported: false },
      ios: { supported: false },
    },
    storages: {
      managedCloud: { supported: true, note: "CloudBlink" },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: true },
      sftp: { supported: true },
      webdav: { supported: true },
      rclone: { supported: "partial", note: "Experimental" },
    },
  },
  {
    slug: "backblaze",
    name: "Backblaze",
    website: "https://www.backblaze.com/cloud-backup/personal",
    pricingUrl: "https://www.backblaze.com/cloud-backup/pricing",
    general: {
      releaseYear: { text: "2008" },
      folderBackups: { supported: true },
      imageBackups: { supported: false },
      openSource: { supported: false },
    },
    features: {
      deduplication: { supported: true },
      compression: null,
      versioning: { supported: true, note: "30 days or 1 year | Forever costs $6/TB" },
      scheduling: { supported: true },
    },
    privacy: {
      endToEndEncryption: { supported: true },
      zeroKnowledge: { supported: "partial", note: "Opt-in" },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: true },
      linux: { supported: false },
      android: { supported: "partial", note: "Restore only" },
      ios: { supported: "partial", note: "Restore only" },
    },
    storages: {
      managedCloud: { supported: true },
      localFilesystem: { supported: false },
      nas: { supported: false },
      s3Compatible: { supported: false },
      sftp: { supported: false },
      webdav: { supported: false },
      rclone: { supported: false },
    },
  },
  {
    slug: "carbonite",
    name: "Carbonite",
    website: "https://carbonite.com",
    pricingUrl: "https://www.carbonite.com/personal/backup/#priceplans",
    general: {
      releaseYear: { text: "2006" },
      folderBackups: { supported: true },
      imageBackups: { supported: false },
      openSource: { supported: false },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true, note: "Max. 3 months" },
      scheduling: { supported: true },
    },
    privacy: {
      endToEndEncryption: { supported: true },
      zeroKnowledge: { supported: "partial", note: "Opt-in" },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: true },
      linux: { supported: false },
      android: { supported: "partial", note: "Restore only" },
      ios: { supported: "partial", note: "Restore only" },
    },
    storages: {
      managedCloud: { supported: true },
      localFilesystem: { supported: false },
      nas: { supported: false },
      s3Compatible: { supported: false },
      sftp: { supported: false },
      webdav: { supported: false },
      rclone: { supported: false },
    },
  },
];
