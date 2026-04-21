import { BACKUP_TOOLS, BackupTool } from "./tools";

export type LabelConfig = {
  text: string;
  link?: string;
  description?: string;
  icon?: string;
  valueType?: "country";
  srText?: {
    true: string;
    false: string;
    partial: string;
  };
};

export const COMPARISON_GENERAL_LABELS: Record<
  keyof BackupTool["general"],
  LabelConfig
> = {
  openSource: {
    text: "Open Source",
    srText: { true: "Yes", false: "No", partial: "Partially" },
  },
  releaseYear: { text: "Release Year" },
  originCountry: { text: "Country of Origin", valueType: "country" },
};

export const COMPARISON_LEVEL_LABELS: Record<
  keyof BackupTool["level"],
  LabelConfig
> = {
  folderBackups: { text: "File/Folder Backups" },
  imageBackups: { text: "Disk Image Backups" },
};

export const COMPARISON_STRATEGY_LABELS: Record<
  keyof BackupTool["strategies"],
  LabelConfig
> = {
  incrementalBackups: {
    text: "Incremental Backups",
    link: "/glossary/what-is-an-incremental-backup",
    description: "Copies changes since the previous backup",
  },
  fullBackups: {
    text: "Full Backups",
    link: "/glossary/what-is-a-full-backup",
    description: "Copies all selected data each time",
  },
  differentialBackups: {
    text: "Differential Backups",
    link: "/glossary/what-is-a-differential-backup",
    description: "Copies changes since the last full backup",
  },
};

export const COMPARISON_FEATURE_LABELS: Record<
  keyof BackupTool["features"],
  LabelConfig
> = {
  deduplication: {
    text: "Deduplication",
    link: "/glossary/what-is-deduplication-in-backups",
    description: "Avoids storing duplicate data",
  },
  compression: {
    text: "Compression",
    link: "/glossary/what-is-compression-in-backups",
    description: "Reduces backup size",
  },
  versioning: {
    text: "Version History",
    description: "Access previous file versions",
  },
  scheduling: {
    text: "Scheduled Backups",
    description: "Automatic backups on a schedule",
  },
};

export const COMPARISON_INTERFACE_LABELS: Record<
  keyof NonNullable<BackupTool["interface"]>,
  LabelConfig
> = {
  cli: {
    text: "Command Line Interface",
    description: "Can be operated from a terminal or shell",
  },
  gui: {
    text: "Graphical User Interface",
    description: "Provides a desktop app or visual interface",
  },
};

export const COMPARISON_PRIVACY_LABELS: Record<
  keyof BackupTool["privacy"],
  LabelConfig
> = {
  endToEndEncryption: {
    text: "End-to-End Encryption",
    link: "/glossary/what-is-end-to-end-encryption-in-backups",
    description: "Encrypted on your device",
  },
  zeroKnowledge: {
    text: "Zero-Knowledge",
    description: "Provider doesn't hold the keys",
  },
};

export const COMPARISON_PLATFORM_LABELS: Record<
  keyof BackupTool["platforms"],
  LabelConfig
> = {
  windows: { text: "Windows", icon: "windows" },
  macos: { text: "macOS", icon: "apple" },
  linux: { text: "Linux", icon: "linux" },
  android: { text: "Android", icon: "android" },
  ios: { text: "iOS", icon: "apple" },
};

export const COMPARISON_STORAGE_LABELS: Record<
  keyof BackupTool["storages"],
  LabelConfig
> = {
  managedCloud: {
    text: "Managed Cloud",
    link: "/glossary/what-is-cloud-backup",
    description: "Provider's own cloud storage",
  },
  localFilesystem: {
    text: "Local Filesystem",
    link: "/glossary/what-is-a-local-backup",
    description: "External drives, USB, etc.",
  },
  nas: {
    text: "Network Attached Storage",
    description: "Backup to NAS devices",
  },
  s3Compatible: {
    text: "S3-Compatible Storage",
    description: "AWS S3, Backblaze B2, etc.",
  },
  sftp: { text: "SFTP", description: "Secure file transfer protocol" },
  webdav: { text: "WebDAV", description: "Web-based file access" },
  rclone: {
    text: "Rclone Remotes",
    description: "50+ cloud providers via Rclone",
  },
};

export function getPublishedComparisonTools(now: number = Date.now()) {
  return BACKUP_TOOLS.filter(
    (tool) => !tool.publishedAt || new Date(tool.publishedAt).getTime() <= now,
  );
}

export function getComparisonSitemap(baseUrl: string) {
  const paths: string[] = [];

  const publishedTools = BACKUP_TOOLS.filter(
    (tool) =>
      !tool.publishedAt || new Date(tool.publishedAt).getTime() <= Date.now(),
  );

  // for (const tool of allTools) {
  //   if (tool.slug === "blinkdisk") continue;
  //   paths.push(`/compare/${tool.slug}-vs-blinkdisk`);
  // }

  for (let i = 0; i < publishedTools.length; i++) {
    for (let j = i + 1; j < publishedTools.length; j++) {
      if (
        publishedTools[i]?.slug === "blinkdisk" ||
        publishedTools[j]?.slug === "blinkdisk"
      )
        continue;
      const [first, second] = [publishedTools[i], publishedTools[j]].sort(
        (a, b) => a?.slug.localeCompare(b?.slug || "") || 0,
      );
      paths.push(`/compare/${first?.slug}-vs-${second?.slug}-vs-blinkdisk`);
    }
  }

  return paths.map((path) => `${baseUrl}${path}`);
}
