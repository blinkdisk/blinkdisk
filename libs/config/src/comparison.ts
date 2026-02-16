export type SupportedValue = {
  supported: boolean | "partial";
  note?: string;
  source?: string;
};

export type StarsValue = {
  stars: 1 | 2 | 3 | 4 | 5;
  note?: string;
  source?: string;
};

export type TextValue = {
  text: string;
  note?: string;
  source?: string;
};

export type CellValue = SupportedValue | StarsValue | TextValue | null;

export type BackupTool = {
  slug: string;
  name: string;
  website: string;
  features: {
    folderBackups: CellValue;
    imageBackups: CellValue;
    incrementalBackups: CellValue;
    deduplication: CellValue;
    compression: CellValue;
    versioning: CellValue;
    scheduling: CellValue;
    openSource: CellValue;
  };
  pricing: {
    freeTier: CellValue;
    startingPrice: CellValue;
    unlimitedStorage: CellValue;
    byoStorage: CellValue;
  };
  privacy: {
    endToEndEncryption: CellValue;
    zeroKnowledge: CellValue;
    localEncryption: CellValue;
  };
  platforms: {
    windows: CellValue;
    macos: CellValue;
    linux: CellValue;
    mobile: CellValue;
  };
  storages: {
    localDrive: CellValue;
    awsS3: CellValue;
    backblazeB2: CellValue;
    googleCloud: CellValue;
    sftp: CellValue;
    managedCloud: CellValue;
  };
  performance: {
    backupSpeed: CellValue;
    restoreSpeed: CellValue;
    resourceUsage: CellValue;
  };
};

export type LabelConfig = {
  text: string;
  link?: string;
};

export const featureLabels: Record<keyof BackupTool["features"], LabelConfig> = {
  folderBackups: { text: "Folder Backups" },
  imageBackups: { text: "Full Disk Image" },
  incrementalBackups: { text: "Incremental Backups", link: "/glossary/what-is-an-incremental-backup" },
  deduplication: { text: "Deduplication", link: "/glossary/what-is-deduplication-in-backups" },
  compression: { text: "Compression", link: "/glossary/what-is-compression-in-backups" },
  versioning: { text: "Version History" },
  scheduling: { text: "Scheduled Backups" },
  openSource: { text: "Open Source" },
};

export const pricingLabels: Record<keyof BackupTool["pricing"], LabelConfig> = {
  freeTier: { text: "Free Tier" },
  startingPrice: { text: "Starting Price" },
  unlimitedStorage: { text: "Unlimited Storage" },
  byoStorage: { text: "Bring Your Own Storage" },
};

export const privacyLabels: Record<keyof BackupTool["privacy"], LabelConfig> = {
  endToEndEncryption: { text: "End-to-End Encryption", link: "/glossary/what-is-end-to-end-encryption-in-backups" },
  zeroKnowledge: { text: "Zero-Knowledge" },
  localEncryption: { text: "Local Encryption" },
};

export const platformLabels: Record<keyof BackupTool["platforms"], LabelConfig> = {
  windows: { text: "Windows" },
  macos: { text: "macOS" },
  linux: { text: "Linux" },
  mobile: { text: "Mobile" },
};

export const storageLabels: Record<keyof BackupTool["storages"], LabelConfig> = {
  localDrive: { text: "Local Drive", link: "/glossary/what-is-a-local-backup" },
  awsS3: { text: "AWS S3" },
  backblazeB2: { text: "Backblaze B2" },
  googleCloud: { text: "Google Cloud" },
  sftp: { text: "SFTP" },
  managedCloud: { text: "Managed Cloud", link: "/glossary/what-is-cloud-backup" },
};

export const performanceLabels: Record<keyof BackupTool["performance"], LabelConfig> = {
  backupSpeed: { text: "Backup Speed" },
  restoreSpeed: { text: "Restore Speed" },
  resourceUsage: { text: "Resource Usage" },
};

export const blinkdisk: BackupTool = {
  slug: "blinkdisk",
  name: "BlinkDisk",
  website: "https://blinkdisk.com?utm_source=compare",
  features: {
    folderBackups: { supported: true },
    imageBackups: { supported: false, note: "Coming soon" },
    incrementalBackups: { supported: true },
    deduplication: { supported: true },
    compression: { supported: true },
    versioning: { supported: true },
    scheduling: { supported: true },
    openSource: { supported: true },
  },
  pricing: {
    freeTier: { supported: true, note: "5GB free with CloudBlink" },
    startingPrice: { text: "$4/mo", note: "200GB CloudBlink plan" },
    unlimitedStorage: { supported: false },
    byoStorage: { supported: true, note: "100% free with your own storage" },
  },
  privacy: {
    endToEndEncryption: { supported: true },
    zeroKnowledge: { supported: true },
    localEncryption: { supported: true },
  },
  platforms: {
    windows: { supported: true },
    macos: { supported: true },
    linux: { supported: true },
    mobile: { supported: false, note: "Desktop only" },
  },
  storages: {
    localDrive: { supported: true },
    awsS3: { supported: true },
    backblazeB2: { supported: true },
    googleCloud: { supported: true },
    sftp: { supported: true },
    managedCloud: { supported: true, note: "CloudBlink" },
  },
  performance: {
    backupSpeed: { stars: 5 },
    restoreSpeed: { stars: 5 },
    resourceUsage: { stars: 5, note: "Lightweight" },
  },
};

export const competitors: BackupTool[] = [
  {
    slug: "backblaze",
    name: "Backblaze",
    website: "https://www.backblaze.com/cloud-backup/personal",
    features: {
      folderBackups: { supported: true },
      imageBackups: { supported: false },
      incrementalBackups: { supported: true },
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true, note: "30 days or 1 year" },
      scheduling: { supported: true },
      openSource: { supported: false },
    },
    pricing: {
      freeTier: { supported: false },
      startingPrice: { text: "$9/mo" },
      unlimitedStorage: { supported: true },
      byoStorage: { supported: false },
    },
    privacy: {
      endToEndEncryption: { supported: "partial", note: "Optional private key" },
      zeroKnowledge: { supported: "partial" },
      localEncryption: { supported: true },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: true },
      linux: { supported: false },
      mobile: { supported: true, note: "View only" },
    },
    storages: {
      localDrive: { supported: false },
      awsS3: { supported: false },
      backblazeB2: { supported: false },
      googleCloud: { supported: false },
      sftp: { supported: false },
      managedCloud: { supported: true },
    },
    performance: {
      backupSpeed: { stars: 4 },
      restoreSpeed: { stars: 3 },
      resourceUsage: { stars: 4 },
    },
  },
  {
    slug: "carbonite",
    name: "Carbonite",
    website: "https://carbonite.com",
    features: {
      folderBackups: { supported: true },
      imageBackups: { supported: true, note: "Plus plan and above" },
      incrementalBackups: { supported: true },
      deduplication: { supported: true },
      compression: { supported: true },
      versioning: { supported: true },
      scheduling: { supported: true },
      openSource: { supported: false },
    },
    pricing: {
      freeTier: { supported: false },
      startingPrice: { text: "$6/mo", note: "Basic plan, billed annually" },
      unlimitedStorage: { supported: true, note: "Basic plan only" },
      byoStorage: { supported: false },
    },
    privacy: {
      endToEndEncryption: { supported: true },
      zeroKnowledge: { supported: false },
      localEncryption: { supported: true },
    },
    platforms: {
      windows: { supported: true },
      macos: { supported: true },
      linux: { supported: false },
      mobile: { supported: true },
    },
    storages: {
      localDrive: { supported: true, note: "Plus plan" },
      awsS3: { supported: false },
      backblazeB2: { supported: false },
      googleCloud: { supported: false },
      sftp: { supported: false },
      managedCloud: { supported: true },
    },
    performance: {
      backupSpeed: { stars: 3 },
      restoreSpeed: { stars: 3 },
      resourceUsage: { stars: 3 },
    },
  },
];
