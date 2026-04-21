import {
  BACKUP_TOOLS,
  BackupTool,
  CellValue,
  FieldValue,
} from "@blinkdisk/constants/tools";

export type NormalizedCellValue = {
  value: FieldValue | null;
  note: string | null;
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

export const NORMALIZED_BACKUP_TOOLS = normalizeComparisonTools(BACKUP_TOOLS);
