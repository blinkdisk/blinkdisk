export type FieldValue = boolean | "partial" | string;

export type CellValue =
  | FieldValue
  | {
      value: FieldValue;
      note: string;
    }
  | null;

export type NormalizedCellValue = {
  value: FieldValue | null;
  note: string | null;
};

export type BackupTool = {
  slug: string;
  aliases?: string[];
  name: string;
  website: string;
  pricingUrl?: string;
  pricing: "free" | "freemium" | "paid";
  publishedAt?: string;
  general: {
    openSource: CellValue;
    releaseYear: CellValue;
    originCountry: CellValue;
  };
  level: {
    folderBackups: CellValue;
    imageBackups: CellValue;
  };
  strategies: {
    incrementalBackups: CellValue;
    fullBackups: CellValue;
    differentialBackups: CellValue;
  };
  features: {
    deduplication: CellValue;
    compression: CellValue;
    versioning: CellValue;
    scheduling: CellValue;
  };
  interface?: {
    cli: CellValue;
    gui: CellValue;
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

type NormalizeCellRecord<T extends Record<string, CellValue>> = {
  [K in keyof T]: NormalizedCellValue;
};

export type NormalizedBackupTool = Omit<
  BackupTool,
  | "general"
  | "level"
  | "strategies"
  | "features"
  | "interface"
  | "privacy"
  | "platforms"
  | "storages"
> & {
  general: NormalizeCellRecord<BackupTool["general"]>;
  level: NormalizeCellRecord<BackupTool["level"]>;
  strategies: NormalizeCellRecord<BackupTool["strategies"]>;
  features: NormalizeCellRecord<BackupTool["features"]>;
  interface?: NormalizeCellRecord<NonNullable<BackupTool["interface"]>>;
  privacy: NormalizeCellRecord<BackupTool["privacy"]>;
  platforms: NormalizeCellRecord<BackupTool["platforms"]>;
  storages: NormalizeCellRecord<BackupTool["storages"]>;
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

export const COMPARISON_GENERAL_LABELS: Record<
  keyof BackupTool["general"],
  LabelConfig
> = {
  openSource: {
    text: "Open Source",
    srText: { true: "Yes", false: "No", partial: "Partially" },
  },
  releaseYear: { text: "Release Year" },
  originCountry: { text: "Country of Origin" },
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
  return COMPARISON_TOOLS.filter(
    (tool) => !tool.publishedAt || new Date(tool.publishedAt).getTime() <= now,
  );
}

export function normalizeCellValue(cell: CellValue): NormalizedCellValue {
  if (cell === null) return { value: null, note: null };
  if (typeof cell === "object") {
    return { value: cell.value, note: cell.note };
  }
  return { value: cell, note: null };
}

function normalizeCellRecord<T extends Record<string, CellValue>>(
  record: T,
): NormalizeCellRecord<T> {
  const normalized = {} as NormalizeCellRecord<T>;

  for (const key of Object.keys(record) as (keyof T)[]) {
    normalized[key] = normalizeCellValue(record[key] ?? null);
  }

  return normalized;
}

export function normalizeBackupTool(tool: BackupTool): NormalizedBackupTool {
  return {
    ...tool,
    general: normalizeCellRecord(tool.general),
    level: normalizeCellRecord(tool.level),
    strategies: normalizeCellRecord(tool.strategies),
    features: normalizeCellRecord(tool.features),
    interface: tool.interface ? normalizeCellRecord(tool.interface) : undefined,
    privacy: normalizeCellRecord(tool.privacy),
    platforms: normalizeCellRecord(tool.platforms),
    storages: normalizeCellRecord(tool.storages),
  };
}

export function normalizeComparisonTools(
  tools: readonly BackupTool[],
): NormalizedBackupTool[] {
  return tools.map(normalizeBackupTool);
}

export function getComparisonSitemap(baseUrl: string) {
  const paths: string[] = [];

  const publishedTools = getPublishedComparisonTools();

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

export const COMPARISON_TOOLS: BackupTool[] = [
  {
    slug: "blinkdisk",
    name: "BlinkDisk",
    website: "https://blinkdisk.com?utm_source=compare",
    pricingUrl: "/cloudblink#pricing",
    pricing: "free",
    general: {
      releaseYear: { value: "2025", note: "Built on Kopia, released in 2019" },
      openSource: true,
      originCountry: "🇦🇹 Austria",
    },
    level: {
      folderBackups: true,
      imageBackups: false,
    },
    strategies: {
      incrementalBackups: {
        value: true,
        note: "Built on Kopia's always-incremental snapshots",
      },
      fullBackups: "partial",
      differentialBackups: "partial",
    },
    features: {
      deduplication: true,
      compression: true,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: false,
      gui: true,
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: true,
    },
    platforms: {
      windows: true,
      macos: true,
      linux: true,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: { value: true, note: "CloudBlink" },
      localFilesystem: true,
      nas: true,
      s3Compatible: true,
      sftp: true,
      webdav: true,
      rclone: { value: "partial", note: "Experimental" },
    },
  },
  {
    slug: "backblaze",
    name: "Backblaze Computer Backup",
    website: "https://www.backblaze.com/cloud-backup/personal",
    pricingUrl: "https://www.backblaze.com/cloud-backup/pricing",
    pricing: "paid",
    general: {
      releaseYear: "2008",
      openSource: false,
      originCountry: "🇺🇸 United States",
    },
    level: {
      folderBackups: true,
      imageBackups: false,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: false,
      differentialBackups: false,
    },
    features: {
      deduplication: true,
      compression: null,
      versioning: {
        value: true,
        note: "30 days or 1 year | Forever costs $6/TB",
      },
      scheduling: true,
    },
    interface: {
      cli: true,
      gui: true,
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: { value: "partial", note: "Opt-in" },
    },
    platforms: {
      windows: true,
      macos: true,
      linux: false,
      android: { value: "partial", note: "Restore only" },
      ios: { value: "partial", note: "Restore only" },
    },
    storages: {
      managedCloud: true,
      localFilesystem: false,
      nas: false,
      s3Compatible: false,
      sftp: false,
      webdav: false,
      rclone: false,
    },
  },
  {
    slug: "carbonite",
    name: "Carbonite",
    website: "https://carbonite.com",
    pricingUrl: "https://www.carbonite.com/personal/backup/#priceplans",
    pricing: "paid",
    general: {
      releaseYear: "2006",
      openSource: false,
      originCountry: "🇺🇸 United States",
    },
    level: {
      folderBackups: true,
      imageBackups: false,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: false,
      differentialBackups: false,
    },
    features: {
      deduplication: true,
      compression: true,
      versioning: { value: true, note: "Max. 3 months" },
      scheduling: true,
    },
    interface: {
      cli: false,
      gui: true,
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: { value: "partial", note: "Opt-in" },
    },
    platforms: {
      windows: true,
      macos: true,
      linux: false,
      android: { value: "partial", note: "Restore only" },
      ios: { value: "partial", note: "Restore only" },
    },
    storages: {
      managedCloud: true,
      localFilesystem: false,
      nas: false,
      s3Compatible: false,
      sftp: false,
      webdav: false,
      rclone: false,
    },
  },
  {
    slug: "crashplan",
    name: "CrashPlan",
    website: "https://crashplan.com",
    pricingUrl: "https://smb.crashplan.com/smb-pricing/",
    pricing: "paid",
    general: {
      releaseYear: "2007",
      openSource: false,
      originCountry: "🇺🇸 United States",
    },
    level: {
      folderBackups: true,
      imageBackups: false,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: false,
      differentialBackups: false,
    },
    features: {
      deduplication: true,
      compression: true,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: true,
      gui: true,
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: { value: "partial", note: "Opt-in" },
    },
    platforms: {
      windows: true,
      macos: true,
      linux: true,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: true,
      localFilesystem: true,
      nas: true,
      s3Compatible: true,
      sftp: null,
      webdav: null,
      rclone: null,
    },
  },
  {
    slug: "acronis-true-image",
    aliases: ["acronis"],
    name: "Acronis True Image",
    website: "https://www.acronis.com/en/products/true-image/",
    pricingUrl: "https://www.acronis.com/en/products/true-image/purchasing/",
    pricing: "paid",
    general: {
      releaseYear: "2003",
      openSource: false,
      originCountry: "🇨🇭 Switzerland",
    },
    level: {
      folderBackups: true,
      imageBackups: true,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: true,
      differentialBackups: true,
    },
    features: {
      deduplication: true,
      compression: true,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: false,
      gui: true,
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: true,
    },
    platforms: {
      windows: true,
      macos: true,
      linux: false,
      android: true,
      ios: true,
    },
    storages: {
      managedCloud: true,
      localFilesystem: true,
      nas: true,
      s3Compatible: false,
      sftp: true,
      webdav: false,
      rclone: false,
    },
  },
  {
    slug: "idrive",
    name: "IDrive",
    website: "https://www.idrive.com",
    pricingUrl: "https://www.idrive.com/pricing",
    pricing: "freemium",
    general: {
      releaseYear: "1995",
      openSource: false,
      originCountry: "🇺🇸 United States",
    },
    level: {
      folderBackups: true,
      imageBackups: { value: "partial", note: "Via IDrive Mirror" },
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: false,
      differentialBackups: null,
    },
    features: {
      deduplication: null,
      compression: false,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: { value: "partial", note: "Linux only" },
      gui: true,
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: { value: "partial", note: "Opt-in at signup" },
    },
    platforms: {
      windows: true,
      macos: true,
      linux: { value: "partial", note: "No GUI" },
      android: true,
      ios: true,
    },
    storages: {
      managedCloud: true,
      localFilesystem: true,
      nas: true,
      s3Compatible: false,
      sftp: false,
      webdav: false,
      rclone: false,
    },
  },
  {
    slug: "duplicacy",
    name: "Duplicacy",
    website: "https://duplicacy.com",
    pricingUrl: "https://duplicacy.com/buy.html",
    pricing: "freemium",
    publishedAt: "2026-04-24",
    general: {
      releaseYear: "2016",
      openSource: {
        value: "partial",
        note: "CLI source-available, GUI proprietary",
      },
      originCountry: "🇺🇸 United States",
    },
    level: {
      folderBackups: true,
      imageBackups: false,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: false,
      differentialBackups: false,
    },
    features: {
      deduplication: true,
      compression: true,
      versioning: true,
      scheduling: { value: "partial", note: "Web GUI only" },
    },
    interface: {
      cli: true,
      gui: { value: "partial", note: "GUI is paid" },
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: true,
    },
    platforms: {
      windows: true,
      macos: true,
      linux: true,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: false,
      localFilesystem: true,
      nas: false,
      s3Compatible: true,
      sftp: true,
      webdav: true,
      rclone: false,
    },
  },
  {
    slug: "easeus-todo-backup",
    name: "EaseUS Todo Backup",
    website: "https://www.easeus.com/backup-software/",
    pricingUrl: "https://www.easeus.com/store/backup.html",
    pricing: "freemium",
    general: {
      releaseYear: "2009",
      openSource: false,
      originCountry: "🇨🇳 China",
    },
    level: {
      folderBackups: true,
      imageBackups: true,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: true,
      differentialBackups: true,
    },
    features: {
      deduplication: null,
      compression: true,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: { value: "partial", note: "Windows only" },
      gui: true,
    },
    privacy: {
      endToEndEncryption: { value: true, note: "AES 256-bit" },
      zeroKnowledge: { value: "partial", note: "Opt-in" },
    },
    platforms: {
      windows: true,
      macos: true,
      linux: false,
      android: true,
      ios: false,
    },
    storages: {
      managedCloud: { value: true, note: "EaseUS Cloud" },
      localFilesystem: true,
      nas: true,
      s3Compatible: true,
      sftp: true,
      webdav: null,
      rclone: false,
    },
  },
  {
    slug: "veeam-agent",
    name: "Veeam Agent",
    website: "https://www.veeam.com/products/free/microsoft-windows.html",
    pricing: "freemium",
    publishedAt: "2026-04-18",
    general: {
      releaseYear: "2017",
      openSource: false,
      originCountry: {
        value: "🇺🇸 United States",
        note: "HQ moved from Switzerland in 2020",
      },
    },
    level: {
      folderBackups: true,
      imageBackups: { value: "partial", note: "Windows & Linux" },
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: true,
      differentialBackups: false,
    },
    features: {
      deduplication: true,
      compression: true,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: { value: "partial", note: "Linux only" },
      gui: { value: true, note: "Windows, Linux and macOS agents" },
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: { value: "partial", note: "Opt-in" },
    },
    platforms: {
      windows: true,
      macos: true,
      linux: true,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: null,
      localFilesystem: true,
      nas: true,
      s3Compatible: true,
      sftp: null,
      webdav: null,
      rclone: false,
    },
  },
  {
    slug: "macrium-reflect-home",
    name: "Macrium Reflect X Home",
    website: "https://www.macrium.com/products/home",
    pricingUrl:
      "https://www.macrium.com/products/home#protect-what-matters-most",
    pricing: "paid",
    publishedAt: "2026-04-22",
    general: {
      releaseYear: "2006",
      openSource: false,
      originCountry: "🇬🇧 United Kingdom",
    },
    level: {
      folderBackups: false,
      imageBackups: true,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: true,
      differentialBackups: true,
    },
    features: {
      deduplication: null,
      compression: true,
      versioning: { value: "partial", note: "Differential only" },
      scheduling: true,
    },
    interface: {
      cli: true,
      gui: true,
    },
    privacy: {
      endToEndEncryption: false,
      zeroKnowledge: false,
    },
    platforms: {
      windows: true,
      macos: false,
      linux: false,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: false,
      localFilesystem: true,
      nas: true,
      s3Compatible: false,
      sftp: false,
      webdav: false,
      rclone: false,
    },
  },
  {
    slug: "uranium-backup",
    name: "Uranium Backup",
    website: "https://www.uranium-backup.com",
    pricingUrl: "https://www.uranium-backup.com/purchase-uranium-backup/",
    pricing: "freemium",
    publishedAt: "2026-04-26",
    general: {
      releaseYear: null,
      openSource: false,
      originCountry: "🇮🇹 Italy",
    },
    level: {
      folderBackups: true,
      imageBackups: { value: "partial", note: "Paid only" },
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: true,
      differentialBackups: true,
    },
    features: {
      deduplication: null,
      compression: true,
      versioning: null,
      scheduling: true,
    },
    interface: {
      cli: false,
      gui: true,
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: null,
    },
    platforms: {
      windows: true,
      macos: false,
      linux: false,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: false,
      localFilesystem: true,
      nas: true,
      s3Compatible: true,
      sftp: true,
      webdav: null,
      rclone: false,
    },
  },
  {
    slug: "aomei-backupper",
    name: "AOMEI Backupper",
    website: "https://www.aomeitech.com/ab/",
    pricingUrl: "https://www.aomeitech.com/ab/comparison.html",
    pricing: "freemium",
    publishedAt: "2026-05-02",
    general: {
      releaseYear: "2012",
      openSource: false,
      originCountry: "🇨🇳 China",
    },
    level: {
      folderBackups: true,
      imageBackups: true,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: true,
      differentialBackups: true,
    },
    features: {
      deduplication: null,
      compression: true,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: { value: "partial", note: "Windows only" },
      gui: true,
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: true,
    },
    platforms: {
      windows: true,
      macos: { value: "partial", note: "Sync only" },
      linux: false,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: true,
      localFilesystem: true,
      nas: true,
      s3Compatible: false,
      sftp: null,
      webdav: null,
      rclone: false,
    },
  },
  {
    slug: "paragon-backup-recovery",
    name: "Paragon Backup & Recovery",
    website: "https://www.paragon-software.com/free/br-free/",
    pricing: "freemium",
    publishedAt: "2026-05-06",
    general: {
      releaseYear: null,
      openSource: false,
      originCountry: "🇩🇪 Germany",
    },
    level: {
      folderBackups: true,
      imageBackups: true,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: true,
      differentialBackups: true,
    },
    features: {
      deduplication: null,
      compression: true,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: false,
      gui: true,
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: true,
    },
    platforms: {
      windows: true,
      macos: false,
      linux: false,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: false,
      localFilesystem: true,
      nas: true,
      s3Compatible: false,
      sftp: false,
      webdav: true,
      rclone: false,
    },
  },
  {
    slug: "kopia",
    name: "Kopia",
    website: "https://kopia.io",
    pricing: "free",
    general: {
      releaseYear: "2019",
      openSource: true,
      originCountry: null,
    },
    level: {
      folderBackups: true,
      imageBackups: false,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: "partial",
      differentialBackups: "partial",
    },
    features: {
      deduplication: true,
      compression: true,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: true,
      gui: true,
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: true,
    },
    platforms: {
      windows: true,
      macos: true,
      linux: true,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: false,
      localFilesystem: true,
      nas: true,
      s3Compatible: true,
      sftp: true,
      webdav: true,
      rclone: { value: "partial", note: "Experimental" },
    },
  },
  {
    slug: "restic",
    name: "Restic",
    website: "https://restic.net",
    pricing: "free",
    publishedAt: "2026-04-20",
    general: {
      releaseYear: "2015",
      openSource: true,
      originCountry: "🇩🇪 Germany",
    },
    level: {
      folderBackups: true,
      imageBackups: false,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: false,
      differentialBackups: false,
    },
    features: {
      deduplication: true,
      compression: true,
      versioning: true,
      scheduling: false,
    },
    interface: {
      cli: true,
      gui: { value: "partial", note: "Inofficial only" },
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: true,
    },
    platforms: {
      windows: true,
      macos: true,
      linux: true,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: false,
      localFilesystem: true,
      nas: true,
      s3Compatible: true,
      sftp: true,
      webdav: false,
      rclone: true,
    },
  },
  {
    slug: "duplicati",
    name: "Duplicati",
    website: "https://duplicati.com",
    pricing: "freemium",
    publishedAt: "2026-04-28",
    general: {
      releaseYear: "2009",
      openSource: true,
      originCountry: "🇩🇰 Denmark",
    },
    level: {
      folderBackups: true,
      imageBackups: false,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: "partial",
      differentialBackups: null,
    },
    features: {
      deduplication: true,
      compression: true,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: true,
      gui: true,
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: true,
    },
    platforms: {
      windows: true,
      macos: true,
      linux: true,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: false,
      localFilesystem: true,
      nas: true,
      s3Compatible: true,
      sftp: true,
      webdav: true,
      rclone: true,
    },
  },
  {
    slug: "msp360-free",
    name: "MSP360 Backup Free",
    website: "https://www.msp360.com/",
    pricing: "freemium",
    publishedAt: "2026-04-30",
    general: {
      releaseYear: "2011",
      openSource: false,
      originCountry: "🇺🇸 United States",
    },
    level: {
      folderBackups: true,
      imageBackups: true,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: true,
      differentialBackups: false,
    },
    features: {
      deduplication: true,
      compression: true,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: true,
      gui: { value: "partial", note: "Windows & macOS only" },
    },
    privacy: {
      endToEndEncryption: "partial",
      zeroKnowledge: "partial",
    },
    platforms: {
      windows: true,
      macos: true,
      linux: true,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: true,
      localFilesystem: true,
      nas: true,
      s3Compatible: true,
      sftp: null,
      webdav: false,
      rclone: false,
    },
  },
  {
    slug: "urbackup",
    name: "UrBackup",
    website: "https://www.urbackup.org",
    pricing: "free",
    publishedAt: "2026-05-04",
    general: {
      releaseYear: "2011",
      openSource: true,
      originCountry: "🇩🇪 Germany",
    },
    level: {
      folderBackups: true,
      imageBackups: true,
    },
    strategies: {
      incrementalBackups: true,
      fullBackups: "partial",
      differentialBackups: false,
    },
    features: {
      deduplication: true,
      compression: true,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: { value: "partial", note: "Linux only" },
      gui: { value: true, note: "Windows & macOS only" },
    },
    privacy: {
      endToEndEncryption: false,
      zeroKnowledge: false,
    },
    platforms: {
      windows: true,
      macos: true,
      linux: true,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: false,
      localFilesystem: true,
      nas: true,
      s3Compatible: false,
      sftp: false,
      webdav: false,
      rclone: false,
    },
  },
  {
    slug: "plakar",
    name: "Plakar",
    website: "https://plakar.io",
    pricing: "free",
    publishedAt: "2026-05-08",
    general: {
      releaseYear: "2025",
      openSource: true,
      originCountry: "🇫🇷 France",
    },
    level: {
      folderBackups: true,
      imageBackups: false,
    },
    strategies: {
      incrementalBackups: {
        value: "partial",
        note: "Deduplicated snapshots store changes, but Plakar does not use chained incremental archives",
      },
      fullBackups: {
        value: "partial",
        note: "Snapshots are self-contained and independently restorable, but there is no separate full-backup mode",
      },
      differentialBackups: false,
    },
    features: {
      deduplication: true,
      compression: true,
      versioning: true,
      scheduling: true,
    },
    interface: {
      cli: true,
      gui: { value: "partial", note: "Limited features" },
    },
    privacy: {
      endToEndEncryption: true,
      zeroKnowledge: true,
    },
    platforms: {
      windows: { value: "partial", note: "Via WSL" },
      macos: true,
      linux: true,
      android: false,
      ios: false,
    },
    storages: {
      managedCloud: false,
      localFilesystem: true,
      nas: true,
      s3Compatible: true,
      sftp: true,
      webdav: false,
      rclone: false,
    },
  },
];

export const NORMALIZED_COMPARISON_TOOLS =
  normalizeComparisonTools(COMPARISON_TOOLS);

export function getPublishedNormalizedComparisonTools(
  now: number = Date.now(),
) {
  return NORMALIZED_COMPARISON_TOOLS.filter(
    (tool) => !tool.publishedAt || new Date(tool.publishedAt).getTime() <= now,
  );
}
