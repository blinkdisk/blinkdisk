export type SupportedValue = {
  supported: boolean | "partial";
  note?: string;
};

export type TextValue = {
  text: string;
  note?: string;
};

export type CellValue = SupportedValue | TextValue | null;

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
      releaseYear: { text: "2025", note: "Built on Kopia, released in 2019" },
      openSource: { supported: true },
      originCountry: { text: "🇦🇹 Austria" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: false },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
        note: "Built on Kopia's always-incremental snapshots",
      },
      fullBackups: { supported: "partial" },
      differentialBackups: {
        supported: "partial",
      },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: false },
      gui: { supported: true },
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
    name: "Backblaze Computer Backup",
    website: "https://www.backblaze.com/cloud-backup/personal",
    pricingUrl: "https://www.backblaze.com/cloud-backup/pricing",
    pricing: "paid",
    general: {
      releaseYear: { text: "2008" },
      openSource: { supported: false },
      originCountry: { text: "🇺🇸 United States" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: false },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: { supported: false },
      differentialBackups: { supported: false },
    },
    features: {
      deduplication: { supported: true },
      compression: null,
      versioning: {
        supported: true,
        note: "30 days or 1 year | Forever costs $6/TB",
      },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: true },
      gui: { supported: true },
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
    pricing: "paid",
    general: {
      releaseYear: { text: "2006" },
      openSource: { supported: false },
      originCountry: { text: "🇺🇸 United States" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: false },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: { supported: false },
      differentialBackups: { supported: false },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true, note: "Max. 3 months" },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: false },
      gui: { supported: true },
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
    slug: "crashplan",
    name: "CrashPlan",
    website: "https://crashplan.com",
    pricingUrl: "https://smb.crashplan.com/smb-pricing/",
    pricing: "paid",
    general: {
      releaseYear: { text: "2007" },
      openSource: { supported: false },
      originCountry: { text: "🇺🇸 United States" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: false },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: { supported: false },
      differentialBackups: { supported: false },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: true },
      gui: { supported: true },
    },
    privacy: {
      endToEndEncryption: { supported: true },
      zeroKnowledge: { supported: "partial", note: "Opt-in" },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: true },
      linux: { supported: true },
      android: { supported: false },
      ios: { supported: false },
    },
    storages: {
      managedCloud: { supported: true },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: true },
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
      releaseYear: { text: "2003" },
      openSource: { supported: false },
      originCountry: { text: "🇨🇭 Switzerland" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: true },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: true,
      },
      differentialBackups: {
        supported: true,
      },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: false },
      gui: { supported: true },
    },
    privacy: {
      endToEndEncryption: { supported: true },
      zeroKnowledge: { supported: true },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: true },
      linux: { supported: false },
      android: { supported: true },
      ios: { supported: true },
    },
    storages: {
      managedCloud: { supported: true },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: false },
      sftp: { supported: true },
      webdav: { supported: false },
      rclone: { supported: false },
    },
  },
  {
    slug: "idrive",
    name: "IDrive",
    website: "https://www.idrive.com",
    pricingUrl: "https://www.idrive.com/pricing",
    pricing: "freemium",
    general: {
      releaseYear: { text: "1995" },
      openSource: { supported: false },
      originCountry: { text: "🇺🇸 United States" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: "partial", note: "Via IDrive Mirror" },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: false,
      },
      differentialBackups: null,
    },
    features: {
      deduplication: null,
      compression: { supported: false },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: "partial", note: "Linux only" },
      gui: { supported: true },
    },
    privacy: {
      endToEndEncryption: { supported: true },
      zeroKnowledge: { supported: "partial", note: "Opt-in at signup" },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: true },
      linux: { supported: "partial", note: "No GUI" },
      android: { supported: true },
      ios: { supported: true },
    },
    storages: {
      managedCloud: { supported: true },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: false },
      sftp: { supported: false },
      webdav: { supported: false },
      rclone: { supported: false },
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
      releaseYear: { text: "2016" },
      openSource: {
        supported: "partial",
        note: "CLI source-available, GUI proprietary",
      },
      originCountry: { text: "🇺🇸 United States" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: false },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: false,
      },
      differentialBackups: { supported: false },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: "partial", note: "Web GUI only" },
    },
    interface: {
      cli: { supported: true },
      gui: { supported: "partial", note: "GUI is paid" },
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
      managedCloud: { supported: false },
      localFilesystem: { supported: true },
      nas: { supported: false },
      s3Compatible: { supported: true },
      sftp: { supported: true },
      webdav: { supported: true },
      rclone: { supported: false },
    },
  },
  {
    slug: "easeus-todo-backup",
    name: "EaseUS Todo Backup",
    website: "https://www.easeus.com/backup-software/",
    pricingUrl: "https://www.easeus.com/store/backup.html",
    pricing: "freemium",
    general: {
      releaseYear: { text: "2009" },
      openSource: { supported: false },
      originCountry: { text: "🇨🇳 China" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: true },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: true,
      },
      differentialBackups: {
        supported: true,
      },
    },
    features: {
      deduplication: null,
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: "partial", note: "Windows only" },
      gui: { supported: true },
    },
    privacy: {
      endToEndEncryption: { supported: true, note: "AES 256-bit" },
      zeroKnowledge: { supported: "partial", note: "Opt-in" },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: true },
      linux: { supported: false },
      android: { supported: true },
      ios: { supported: false },
    },
    storages: {
      managedCloud: { supported: true, note: "EaseUS Cloud" },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: true },
      sftp: { supported: true },
      webdav: null,
      rclone: { supported: false },
    },
  },
  {
    slug: "veeam-agent",
    name: "Veeam Agent",
    website: "https://www.veeam.com/products/free/microsoft-windows.html",
    pricing: "freemium",
    publishedAt: "2026-04-18",
    general: {
      releaseYear: { text: "2017" },
      openSource: { supported: false },
      originCountry: {
        text: "🇺🇸 United States",
        note: "HQ moved from Switzerland in 2020",
      },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: "partial", note: "Windows & Linux" },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: true,
      },
      differentialBackups: {
        supported: false,
      },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: {
        supported: "partial",
        note: "Linux only",
      },
      gui: { supported: true, note: "Windows, Linux and macOS agents" },
    },
    privacy: {
      endToEndEncryption: { supported: true },
      zeroKnowledge: { supported: "partial", note: "Opt-in" },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: true },
      linux: { supported: true },
      android: { supported: false },
      ios: { supported: false },
    },
    storages: {
      managedCloud: null,
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: true },
      sftp: null,
      webdav: null,
      rclone: { supported: false },
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
      releaseYear: { text: "2006" },
      openSource: { supported: false },
      originCountry: { text: "🇬🇧 United Kingdom" },
    },
    level: {
      folderBackups: { supported: false },
      imageBackups: { supported: true },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: true,
      },
      differentialBackups: {
        supported: true,
      },
    },
    features: {
      deduplication: null,
      compression: { supported: true },
      versioning: { supported: "partial", note: "Differential only" },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: true },
      gui: { supported: true },
    },
    privacy: {
      endToEndEncryption: { supported: false },
      zeroKnowledge: { supported: false },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: false },
      linux: { supported: false },
      android: { supported: false },
      ios: { supported: false },
    },
    storages: {
      managedCloud: { supported: false },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: false },
      sftp: { supported: false },
      webdav: { supported: false },
      rclone: { supported: false },
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
      openSource: { supported: false },
      originCountry: { text: "🇮🇹 Italy" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: "partial", note: "Paid only" },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: true,
      },
      differentialBackups: {
        supported: true,
      },
    },
    features: {
      deduplication: null,
      compression: { supported: true },
      versioning: null,
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: false },
      gui: { supported: true },
    },
    privacy: {
      endToEndEncryption: { supported: true },
      zeroKnowledge: null,
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: false },
      linux: { supported: false },
      android: { supported: false },
      ios: { supported: false },
    },
    storages: {
      managedCloud: { supported: false },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: true },
      sftp: { supported: true },
      webdav: null,
      rclone: { supported: false },
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
      releaseYear: { text: "2012" },
      openSource: { supported: false },
      originCountry: { text: "🇨🇳 China" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: true },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: true,
      },
      differentialBackups: {
        supported: true,
      },
    },
    features: {
      deduplication: null,
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: "partial", note: "Windows only" },
      gui: { supported: true },
    },
    privacy: {
      endToEndEncryption: { supported: true },
      zeroKnowledge: { supported: true },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: "partial", note: "Sync only" },
      linux: { supported: false },
      android: { supported: false },
      ios: { supported: false },
    },
    storages: {
      managedCloud: { supported: true },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: false },
      sftp: null,
      webdav: null,
      rclone: { supported: false },
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
      openSource: { supported: false },
      originCountry: { text: "🇩🇪 Germany" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: true },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: true,
      },
      differentialBackups: {
        supported: true,
      },
    },
    features: {
      deduplication: null,
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: false },
      gui: { supported: true },
    },
    privacy: {
      endToEndEncryption: { supported: true },
      zeroKnowledge: { supported: true },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: false },
      linux: { supported: false },
      android: { supported: false },
      ios: { supported: false },
    },
    storages: {
      managedCloud: { supported: false },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: false },
      sftp: { supported: false },
      webdav: { supported: true },
      rclone: { supported: false },
    },
  },
  {
    slug: "kopia",
    name: "Kopia",
    website: "https://kopia.io",
    pricing: "free",
    general: {
      releaseYear: { text: "2019" },
      openSource: { supported: true },
      originCountry: null,
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: false },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: "partial",
      },
      differentialBackups: {
        supported: "partial",
      },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: true },
      gui: { supported: true },
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
      managedCloud: { supported: false },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: true },
      sftp: { supported: true },
      webdav: { supported: true },
      rclone: { supported: "partial", note: "Experimental" },
    },
  },
  {
    slug: "restic",
    name: "Restic",
    website: "https://restic.net",
    pricing: "free",
    publishedAt: "2026-04-20",
    general: {
      releaseYear: { text: "2015" },
      openSource: { supported: true },
      originCountry: { text: "🇩🇪 Germany" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: false },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: { supported: false },
      differentialBackups: { supported: false },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: false },
    },
    interface: {
      cli: { supported: true },
      gui: { supported: "partial", note: "Inofficial only" },
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
      managedCloud: { supported: false },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: true },
      sftp: { supported: true },
      webdav: { supported: false },
      rclone: { supported: true },
    },
  },
  {
    slug: "duplicati",
    name: "Duplicati",
    website: "https://duplicati.com",
    pricing: "freemium",
    publishedAt: "2026-04-28",
    general: {
      releaseYear: { text: "2009" },
      openSource: { supported: true },
      originCountry: { text: "🇩🇰 Denmark" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: false },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: "partial",
      },
      differentialBackups: null,
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: true },
      gui: { supported: true },
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
      managedCloud: { supported: false },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: true },
      sftp: { supported: true },
      webdav: { supported: true },
      rclone: { supported: true },
    },
  },
  {
    slug: "msp360-free",
    name: "MSP360 Backup Free",
    website: "https://www.msp360.com/",
    pricing: "freemium",
    publishedAt: "2026-04-30",
    general: {
      releaseYear: { text: "2011" },
      openSource: { supported: false },
      originCountry: { text: "🇺🇸 United States" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: true },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: true,
      },
      differentialBackups: { supported: false },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: true },
      gui: {
        supported: "partial",
        note: "Windows & macOS only",
      },
    },
    privacy: {
      endToEndEncryption: { supported: "partial" },
      zeroKnowledge: { supported: "partial" },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: true },
      linux: { supported: true },
      android: { supported: false },
      ios: { supported: false },
    },
    storages: {
      managedCloud: { supported: true },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: true },
      sftp: null,
      webdav: { supported: false },
      rclone: { supported: false },
    },
  },
  {
    slug: "urbackup",
    name: "UrBackup",
    website: "https://www.urbackup.org",
    pricing: "free",
    publishedAt: "2026-05-04",
    general: {
      releaseYear: { text: "2011" },
      openSource: { supported: true },
      originCountry: { text: "🇩🇪 Germany" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: true },
    },
    strategies: {
      incrementalBackups: {
        supported: true,
      },
      fullBackups: {
        supported: "partial",
      },
      differentialBackups: {
        supported: false,
      },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: {
        supported: "partial",
        note: "Linux only",
      },
      gui: { supported: true, note: "Windows & macOS only" },
    },
    privacy: {
      endToEndEncryption: { supported: false },
      zeroKnowledge: { supported: false },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: true },
      linux: { supported: true },
      android: { supported: false },
      ios: { supported: false },
    },
    storages: {
      managedCloud: { supported: false },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: false },
      sftp: { supported: false },
      webdav: { supported: false },
      rclone: { supported: false },
    },
  },
  {
    slug: "plakar",
    name: "Plakar",
    website: "https://plakar.io",
    pricing: "free",
    publishedAt: "2026-05-08",
    general: {
      releaseYear: { text: "2025" },
      openSource: { supported: true },
      originCountry: { text: "🇫🇷 France" },
    },
    level: {
      folderBackups: { supported: true },
      imageBackups: { supported: false },
    },
    strategies: {
      incrementalBackups: {
        supported: "partial",
        note: "Deduplicated snapshots store changes, but Plakar does not use chained incremental archives",
      },
      fullBackups: {
        supported: "partial",
        note: "Snapshots are self-contained and independently restorable, but there is no separate full-backup mode",
      },
      differentialBackups: { supported: false },
    },
    features: {
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
    },
    interface: {
      cli: { supported: true },
      gui: { supported: "partial", note: "Limited features" },
    },
    privacy: {
      endToEndEncryption: { supported: true },
      zeroKnowledge: { supported: true },
    },
    platforms: {
      windows: {
        supported: "partial",
        note: "Via WSL",
      },
      macos: { supported: true },
      linux: { supported: true },
      android: { supported: false },
      ios: { supported: false },
    },
    storages: {
      managedCloud: { supported: false },
      localFilesystem: { supported: true },
      nas: { supported: true },
      s3Compatible: { supported: true },
      sftp: { supported: true },
      webdav: { supported: false },
      rclone: { supported: false },
    },
  },
];
