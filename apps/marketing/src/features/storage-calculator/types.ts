export type CalculatorPage = "backup" | "s3";
export type StorageUnit = "GB" | "TB";
export type CalculatorState = {
  storage: number;
  storageUnit: StorageUnit;
  months: number;
  downloads: number;
  downloadUnit: StorageUnit;
  objectSize: number;
  billing: "monthly" | "yearly";
  advanced: boolean;
  sort: "cost" | "provider";
  details: string[];
};

export type PriceTier = { upTo: number | null; rate: number };
export type UsagePrice = {
  tiers: PriceTier[];
  free?: number;
  roundTo?: number;
};
export type RequestPrice = {
  per: number;
  price: number;
  free?: number;
  roundTo?: number;
};
export type StoragePackage = {
  capacityGB: number;
  monthly?: number;
  yearly?: number;
};
export type StoragePricing = {
  unit: "GB" | "GiB";
  storage: UsagePrice;
  download: UsagePrice;
  upload?: UsagePrice;
  retrieval?: UsagePrice;
  writes?: RequestPrice;
  reads?: RequestPrice;
  requests?: RequestPrice;
  baseMonthly?: number;
  minimumStorage?: number;
  minimumMonthly?: number;
  minimumMonths?: number;
  minimumObjectBytes?: number;
  objectOverheadBytes?: number;
  freeDownloadMultiple?: number;
  downloadLimitMultiple?: number;
  minimumDownloadLimitGB?: number;
  maximumObjects?: number;
  maximumStorageGB?: number;
  maximumDownloadGB?: number;
  packages?: StoragePackage[];
};

export type StorageOffer = {
  id: string;
  provider: string;
  product: string;
  region: string;
  currency: "USD" | "EUR";
  exchangeRate: number;
  exchangeDate?: string;
  exchangeSource?: string;
  reviewedAt: string;
  sources: { label: string; url: string }[];
  s3Evidence?: string;
  pricing: StoragePricing;
  notes: string[];
};

export type CostBreakdown = {
  storage: number;
  upload: number;
  download: number;
  retrieval: number;
  requests: number;
  minimum: number;
  commitment: number;
};

export type CalculationResult = {
  offer: StorageOffer;
  total: number | null;
  monthly: number | null;
  costs: CostBreakdown;
  reason?: string;
  notes: string[];
  storedGB: number;
  objects: number;
};
