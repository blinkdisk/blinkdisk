import { toGB } from "@marketing/features/storage-calculator/state";
import type {
  CalculationResult,
  CalculatorState,
  RequestPrice,
  StorageOffer,
  UsagePrice,
} from "@marketing/features/storage-calculator/types";

export function usageCost(units: number, price: UsagePrice) {
  const free = price.free ?? 0;
  const billable = Math.max(0, units - free);
  const metered = price.roundTo
    ? Math.ceil(billable / price.roundTo) * price.roundTo + free
    : units;
  let total = 0;
  let previous = 0;
  for (const tier of price.tiers) {
    const count = Math.max(
      0,
      Math.min(metered, tier.upTo ?? metered) - Math.max(previous, free),
    );
    total += count * tier.rate;
    if (tier.upTo === null || metered <= tier.upTo) break;
    previous = tier.upTo ?? previous;
  }
  return total;
}

function requestCost(count: number, price?: RequestPrice) {
  if (!price) return 0;
  const billable = Math.max(0, count - (price.free ?? 0));
  return (
    ((price.roundTo
      ? Math.ceil(billable / price.roundTo) * price.roundTo
      : billable) /
      price.per) *
    price.price
  );
}

export function calculateOffer(
  offer: StorageOffer,
  state: CalculatorState,
): CalculationResult {
  const storedGB = toGB(state.storage, state.storageUnit);
  const downloadGB = toGB(state.downloads, state.downloadUnit);
  const objects = Math.ceil((storedGB * 1000) / state.objectSize);
  const result: CalculationResult = {
    offer,
    total: null,
    monthly: null,
    costs: {
      storage: 0,
      upload: 0,
      download: 0,
      retrieval: 0,
      requests: 0,
      minimum: 0,
      commitment: 0,
    },
    notes: [...offer.notes],
    storedGB,
    objects,
  };
  const pricing = offer.pricing;
  const unavailable = (reason: string) => ({ ...result, reason });
  if (
    ![storedGB, downloadGB, state.objectSize, state.months].every(
      Number.isFinite,
    ) ||
    storedGB <= 0 ||
    downloadGB < 0 ||
    state.objectSize <= 0 ||
    !Number.isInteger(state.months) ||
    state.months < 1
  ) {
    return unavailable(
      "Enter a valid amount of data, duration and object size.",
    );
  }
  if (pricing.maximumStorageGB && storedGB > pricing.maximumStorageGB) {
    return unavailable(
      "This is more data than the provider’s published plans cover.",
    );
  }
  if (pricing.maximumObjects && objects > pricing.maximumObjects) {
    return unavailable(
      "Your estimated object count is above the provider’s standard account limit.",
    );
  }
  if (pricing.maximumDownloadGB && downloadGB > pricing.maximumDownloadGB) {
    return unavailable(
      "Your monthly downloads go beyond the public rate card. The provider only quotes this on request.",
    );
  }
  if (
    pricing.downloadLimitMultiple !== undefined &&
    downloadGB >
      Math.max(
        storedGB * pricing.downloadLimitMultiple,
        pricing.minimumDownloadLimitGB ?? 0,
      )
  ) {
    return unavailable(
      "Your monthly downloads are above the limit in this offer’s usage policy.",
    );
  }

  const unitGB = pricing.unit === "GiB" ? 2 ** 30 / 1e9 : 1;
  const rawUnits = storedGB / unitGB;
  const objectBytes = state.objectSize * 1e6;
  const lastObjectBytes = storedGB * 1e9 - (objects - 1) * objectBytes;
  const minimumObjectBytes = pricing.minimumObjectBytes ?? 0;
  const storedUnits =
    ((objects - 1) * Math.max(objectBytes, minimumObjectBytes) +
      Math.max(lastObjectBytes, minimumObjectBytes) +
      objects * (pricing.objectOverheadBytes ?? 0)) /
    (unitGB * 1e9);
  const downloadedUnits = downloadGB / unitGB;
  const reads = Math.ceil((downloadGB * 1000) / state.objectSize);
  const storageMonthly =
    (pricing.baseMonthly ?? 0) +
    usageCost(
      Math.max(storedUnits, pricing.minimumStorage ?? 0),
      pricing.storage,
    );
  const downloadMonthly = usageCost(
    Math.max(
      0,
      downloadedUnits - rawUnits * (pricing.freeDownloadMultiple ?? 0),
    ),
    pricing.download,
  );
  const retrievalMonthly = pricing.retrieval
    ? usageCost(downloadedUnits, pricing.retrieval)
    : 0;
  const readMonthly =
    requestCost(reads, pricing.reads) + requestCost(reads, pricing.requests);
  const writeTotal =
    requestCost(objects, pricing.writes) +
    requestCost(objects + reads, pricing.requests) -
    requestCost(reads, pricing.requests);
  const uploadTotal = pricing.upload ? usageCost(rawUnits, pricing.upload) : 0;

  result.costs.storage = storageMonthly * state.months;
  result.costs.upload = uploadTotal;
  result.costs.download = downloadMonthly * state.months;
  result.costs.retrieval = retrievalMonthly * state.months;
  result.costs.requests = writeTotal + readMonthly * state.months;

  const packages = pricing.packages?.filter((p) =>
    state.billing === "yearly"
      ? p.yearly !== undefined
      : p.monthly !== undefined,
  );
  if (packages?.length) {
    const plan = [...packages]
      .sort((a, b) => a.capacityGB - b.capacityGB)
      .find((p) => p.capacityGB >= storedGB);
    if (!plan)
      return unavailable(
        "No published plan fits this amount of data with the billing option you picked.",
      );
    const annual = state.billing === "yearly" && plan.yearly !== undefined;
    const monthly = annual ? (plan.yearly ?? 0) / 12 : (plan.monthly ?? 0);
    result.costs.storage = monthly * state.months;
    result.costs.commitment = annual
      ? Math.max(
          0,
          Math.ceil(state.months / 12) * (plan.yearly ?? 0) -
            result.costs.storage,
        )
      : 0;
    result.notes.push(
      `Uses the ${plan.capacityGB.toLocaleString("en-US")} GB plan.`,
    );
    if (annual)
      result.notes.push(
        `Paid ${Math.ceil(state.months / 12) === 1 ? "one year" : `${Math.ceil(state.months / 12)} years`} upfront. Months you don’t use are still in the total.`,
      );
  } else {
    const extraMonths = Math.max(
      0,
      (pricing.minimumMonths ?? 0) - state.months,
    );
    result.costs.commitment =
      usageCost(storedUnits, { ...pricing.storage, free: 0 }) * extraMonths;
    if (extraMonths)
      result.notes.push(
        `Includes ${extraMonths} extra month${extraMonths === 1 ? "" : "s"} of storage, because the provider bills deleted data until its minimum retention period ends.`,
      );
    if (state.billing === "yearly")
      result.notes.push(
        "No public annual discount, so this is billed monthly.",
      );
  }
  const recurring =
    result.costs.storage / state.months +
    downloadMonthly +
    retrievalMonthly +
    readMonthly;
  result.costs.minimum =
    Math.max(
      0,
      (pricing.minimumMonthly ?? 0) - recurring - uploadTotal - writeTotal,
    ) +
    Math.max(0, (pricing.minimumMonthly ?? 0) - recurring) * (state.months - 1);
  if (
    minimumObjectBytes > Math.min(objectBytes, lastObjectBytes) ||
    (pricing.objectOverheadBytes ?? 0) > 0
  )
    result.notes.push(
      "Small objects are billed at a minimum size or with per-object overhead, which adds to billable storage.",
    );
  for (const key of Object.keys(
    result.costs,
  ) as (keyof typeof result.costs)[]) {
    result.costs[key] *= offer.exchangeRate;
  }
  result.total = Object.values(result.costs).reduce(
    (sum, value) => sum + value,
    0,
  );
  result.monthly = result.total / state.months;
  return result;
}

export function calculateOffers(
  offers: StorageOffer[],
  state: CalculatorState,
) {
  return offers
    .map((offer) => calculateOffer(offer, state))
    .sort((a, b) => {
      if (a.total === null && b.total !== null) return 1;
      if (b.total === null && a.total !== null) return -1;
      if (
        state.sort === "cost" &&
        a.total !== null &&
        b.total !== null &&
        a.total !== b.total
      )
        return a.total - b.total;
      return `${a.offer.provider} ${a.offer.product}`.localeCompare(
        `${b.offer.provider} ${b.offer.product}`,
        "en",
      );
    });
}
