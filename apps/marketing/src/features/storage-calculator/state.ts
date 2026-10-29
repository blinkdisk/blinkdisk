import type {
  CalculatorPage,
  CalculatorState,
} from "@marketing/features/storage-calculator/types";

export const MAX_STORAGE = 1_000_000;
export const MAX_MONTHS = 120;

export function defaultState(page: CalculatorPage): CalculatorState {
  return {
    storage: 3,
    storageUnit: "TB",
    months: 12,
    downloads: 2,
    downloadUnit: "TB",
    objectSize: 20,
    billing: "yearly",
    advanced: page === "s3",
    sort: "cost",
    details: [],
  };
}

function numberParam(
  params: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number,
  integer = false,
) {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) &&
    value >= min &&
    value <= max &&
    (!integer || Number.isInteger(value))
    ? value
    : fallback;
}

export function readState(
  params: URLSearchParams,
  page: CalculatorPage,
  offerIds: string[],
): CalculatorState {
  const defaults = defaultState(page);
  return {
    storage: numberParam(
      params,
      "storage",
      defaults.storage,
      0.001,
      MAX_STORAGE,
    ),
    storageUnit: params.get("storageUnit") === "GB" ? "GB" : "TB",
    months: numberParam(params, "months", defaults.months, 1, MAX_MONTHS, true),
    downloads: numberParam(
      params,
      "downloads",
      defaults.downloads,
      0,
      MAX_STORAGE,
    ),
    downloadUnit: params.get("downloadUnit") === "GB" ? "GB" : "TB",
    objectSize: numberParam(
      params,
      "objectSize",
      defaults.objectSize,
      0.001,
      5_000_000,
    ),
    billing:
      params.get("billing") === "monthly"
        ? "monthly"
        : params.get("billing") === "yearly"
          ? "yearly"
          : defaults.billing,
    advanced: page === "s3" || params.get("advanced") === "true",
    sort: params.get("sort") === "provider" ? "provider" : "cost",
    details: [...new Set(params.get("details")?.split(",") ?? [])].filter(
      (id) => offerIds.includes(id),
    ),
  };
}

export function writeState(
  original: URLSearchParams,
  state: CalculatorState,
  page: CalculatorPage,
) {
  const params = new URLSearchParams(original);
  const defaults = defaultState(page);
  for (const key of Object.keys(defaults) as (keyof CalculatorState)[]) {
    const value = Array.isArray(state[key])
      ? state.details.join(",")
      : String(state[key]);
    const fallback = Array.isArray(defaults[key]) ? "" : String(defaults[key]);
    if (value === fallback) params.delete(key);
    else params.set(key, value);
  }
  return params;
}

export function toGB(value: number, unit: "GB" | "TB") {
  return value * (unit === "TB" ? 1000 : 1);
}
