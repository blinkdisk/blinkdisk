import { SUBSCRIPTION_PLANS } from "@blinkdisk/constants/plans";
import type {
  CalculatorPage,
  StorageOffer,
  StoragePricing,
  UsagePrice,
} from "@marketing/features/storage-calculator/types";

export const REVIEWED_AT = "2026-10-29";
export const UPSTREAM_SOURCE =
  "https://github.com/zeroservices/s3compare.io_data";
export const EUR_USD = {
  rate: 1.113,
  date: "2026-10-29",
  source:
    "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html",
};

const flat = (rate: number, free = 0, roundTo?: number): UsagePrice => ({
  tiers: [{ upTo: null, rate }],
  free,
  roundTo,
});
const metered = (storage: number, download = 0): StoragePricing => ({
  unit: "GB",
  storage: flat(storage),
  download: flat(download),
});
type OfferInput = Pick<
  StorageOffer,
  "id" | "provider" | "product" | "region"
> & {
  url: string;
  s3Evidence?: string;
  pricing?: StoragePricing;
  unavailableReason?: string;
  notes?: string[];
  currency?: "USD" | "EUR";
  additionalSources?: StorageOffer["sources"];
};

function offer(input: OfferInput): StorageOffer {
  return {
    id: input.id,
    provider: input.provider,
    product: input.product,
    region: input.region,
    currency: input.currency ?? "USD",
    exchangeRate: input.currency === "EUR" ? EUR_USD.rate : 1,
    ...(input.currency === "EUR"
      ? { exchangeDate: EUR_USD.date, exchangeSource: EUR_USD.source }
      : {}),
    reviewedAt: REVIEWED_AT,
    sources: [
      { label: "Official pricing", url: input.url },
      ...(input.additionalSources ?? []),
    ],
    s3Evidence: input.s3Evidence,
    pricing: input.pricing,
    unavailableReason: input.unavailableReason,
    notes: input.notes ?? [],
  };
}

const awsSource = "https://aws.amazon.com/s3/pricing/";
const awsDownload: UsagePrice = {
  free: 100,
  tiers: [
    { upTo: 10 * 1024, rate: 0.09 },
    { upTo: 50 * 1024, rate: 0.085 },
    { upTo: 150 * 1024, rate: 0.07 },
    { upTo: null, rate: 0.05 },
  ],
};

export const STORAGE_OFFERS: StorageOffer[] = [
  offer({
    id: "cloudblink",
    provider: "BlinkDisk",
    product: "CloudBlink",
    region: "Managed placement; no user-selected region",
    url: "https://blinkdisk.com/cloudblink",
    pricing: {
      ...metered(0),
      maximumStorageGB: 10_000,
      downloadLimitMultiple: 5,
      minimumDownloadLimitGB: 1,
      packages: SUBSCRIPTION_PLANS.map((plan) => ({
        capacityGB: plan.storageGB,
        monthly: plan.prices.find((price) => price.period === "MONTHLY")
          ?.amount,
        yearly: plan.prices.find((price) => price.period === "YEARLY")?.amount,
      })),
    },
    notes: [
      "Managed backup storage used exclusively through BlinkDisk.",
      "Downloads are limited per vault to 5× stored data (at least 1 GB), resetting every 30 days. This estimate assumes one vault with constant usage.",
      "The free trial is not deducted from regular pricing.",
    ],
  }),
  offer({
    id: "aws-standard",
    provider: "AWS",
    product: "S3 Standard",
    region: "US East (N. Virginia), us-east-1",
    url: awsSource,
    s3Evidence: awsSource,
    pricing: {
      ...metered(0.023),
      unit: "GiB",
      storage: {
        tiers: [
          { upTo: 50 * 1024, rate: 0.023 },
          { upTo: 500 * 1024, rate: 0.022 },
          { upTo: null, rate: 0.021 },
        ],
      },
      download: awsDownload,
      writes: { per: 1000, price: 0.005 },
      reads: { per: 1000, price: 0.0004 },
    },
    notes: [
      "Assumes the account-wide 100 GB monthly internet transfer allowance is unused. Temporary AWS signup credits are excluded.",
      "AWS labels binary storage units as GB; inputs are converted from decimal GB.",
    ],
  }),
  offer({
    id: "aws-glacier-instant",
    provider: "AWS",
    product: "S3 Glacier Instant Retrieval",
    region: "US East (N. Virginia), us-east-1",
    url: awsSource,
    s3Evidence: awsSource,
    pricing: {
      ...metered(0.004),
      unit: "GiB",
      download: awsDownload,
      minimumMonths: 3,
      minimumObjectBytes: 128 * 1024,
      retrieval: flat(0.03),
      writes: { per: 1000, price: 0.02 },
      reads: { per: 1000, price: 0.01 },
    },
    notes: [
      "Immediate access, unlike Glacier Flexible Retrieval or Deep Archive.",
      "90-day minimum retention; 128 KiB minimum billed object size. The AWS account-wide transfer allowance is assumed unused.",
    ],
  }),
  offer({
    id: "azure-hot",
    provider: "Azure",
    product: "Blob Storage (Hot)",
    region: "Not priced; redundancy and region need verification",
    url: "https://azure.microsoft.com/en-us/pricing/details/storage/blobs/",
    unavailableReason:
      "A complete current regional rate card, including redundancy and transaction prices, could not be verified.",
  }),
  offer({
    id: "google-standard",
    provider: "Google Cloud",
    product: "Cloud Storage Standard",
    region: "Iowa, us-central1; internet to North America / Europe",
    url: "https://cloud.google.com/storage/pricing",
    s3Evidence: "https://cloud.google.com/storage/docs/interoperability",
    pricing: {
      ...metered(0.02),
      unit: "GiB",
      storage: flat(0.02, 5),
      download: {
        free: 100,
        tiers: [
          { upTo: 10 * 1024, rate: 0.12 },
          { upTo: 150 * 1024, rate: 0.11 },
          { upTo: null, rate: 0.08 },
        ],
      },
      writes: { per: 1000, price: 0.005, free: 5000 },
      reads: { per: 1000, price: 0.0004, free: 50_000 },
    },
    notes: [
      "Uses the XML API interoperability mode with HMAC keys; AWS feature parity is not implied.",
      "Assumes eligible Always Free allowances are unused. Australia and China transfer destinations are not covered.",
      "Object soft delete and versioning are assumed disabled; retained deleted data would add charges.",
    ],
  }),
  offer({
    id: "wasabi",
    provider: "Wasabi",
    product: "Hot Cloud Storage",
    region: "US East, us-east-1",
    url: "https://wasabi.com/pricing/faq",
    s3Evidence:
      "https://docs.wasabi.com/docs/what-are-the-service-urls-for-wasabis-different-storage-regions",
    pricing: {
      ...metered(7.99 / 1024),
      unit: "GiB",
      minimumStorage: 1024,
      minimumMonths: 3,
      downloadLimitMultiple: 1,
    },
    notes: [
      "1 TiB minimum active-storage charge; 90-day object retention.",
      "The free-egress policy expects monthly downloads no greater than active storage; larger workloads require provider review.",
      "Wasabi’s displayed TB price uses base-2 units.",
    ],
  }),
  offer({
    id: "ovh",
    provider: "OVHcloud",
    product: "Object Storage Standard (Multi Zone)",
    region: "France, Paris; non-APAC contract",
    url: "https://www.ovhcloud.com/en/public-cloud/prices/",
    s3Evidence: "https://www.ovhcloud.com/en/public-cloud/object-storage/",
    pricing: {
      ...metered(0),
      unit: "GiB",
      storage: {
        roundTo: 1,
        tiers: [
          { upTo: 50 * 1024, rate: 0.00002152 * 730 },
          { upTo: 500 * 1024, rate: 0.00001921 * 730 },
          { upTo: null, rate: 0.0000169 * 730 },
        ],
      },
    },
    notes: [
      "730 hours per estimated billing month; published USD prices before tax.",
      "Multi Zone Standard is the current reference offer; the legacy generic CSV row is not treated as a separate product.",
    ],
  }),
  offer({
    id: "backblaze",
    provider: "Backblaze",
    product: "B2 Cloud Storage",
    region: "US West, us-west-004",
    url: "https://www.backblaze.com/cloud-storage/pricing",
    s3Evidence:
      "https://www.backblaze.com/docs/cloud-storage-s3-compatible-api",
    pricing: { ...metered(0.00695, 0.01), freeDownloadMultiple: 3 },
    notes: [
      "Uses the current $6.95/TB monthly list rate and free transactions. Internet egress above 3× average stored data costs $0.01/GB.",
      "No minimum object size or storage retention period. Promotional credits are excluded.",
    ],
  }),
  offer({
    id: "digitalocean",
    provider: "DigitalOcean",
    product: "Spaces",
    region: "New York, NYC3",
    url: "https://www.digitalocean.com/pricing/spaces-object-storage",
    s3Evidence: "https://docs.digitalocean.com/products/spaces/",
    pricing: {
      ...metered(0.02),
      unit: "GiB",
      baseMonthly: 5,
      storage: flat(0.02, 250),
      download: flat(0.01, 1024),
    },
    notes: [
      "$5/month includes 250 GiB storage and 1 TiB outbound transfer. API requests are included; CDN-related additional services are excluded.",
    ],
  }),
  offer({
    id: "vultr",
    provider: "Vultr",
    product: "Object Storage (Standard)",
    region: "New Jersey, ewr1",
    url: "https://docs.vultr.com/support/platform/billing/how-is-object-storage-billed",
    s3Evidence: "https://docs.vultr.com/products/storage/object-storage",
    unavailableReason:
      "The storage bundle is documented, but current request fees and billing-unit definitions need confirmation before a full estimate can be shown.",
    notes: [
      "The documented Standard bundle starts at $18/month with 1,000 GB storage and transfer. This is not presented as a complete cost estimate.",
    ],
  }),
  offer({
    id: "linode",
    provider: "Akamai (Linode)",
    product: "Object Storage",
    region: "North America, Newark",
    url: "https://www.akamai.com/cloud/pricing/object-storage",
    s3Evidence: "https://www.akamai.com/products/object-storage",
    unavailableReason:
      "Storage and bandwidth prices are public, but the applicable endpoint generation and request charges need verification.",
  }),
  offer({
    id: "scaleway",
    provider: "Scaleway",
    product: "Object Storage Standard Multi-AZ",
    region: "Paris, fr-par",
    url: "https://www.scaleway.com/en/pricing/storage/",
    s3Evidence: "https://www.scaleway.com/en/docs/object-storage/faq/",
    currency: "EUR",
    pricing: {
      ...metered(0),
      storage: flat(0.000022 * 730, 0, 1),
      download: flat(0.01, 75),
    },
    notes: [
      "730 hours per estimated month. Whole-GB billing is applied to total stored volume, not to each object.",
      "Requests and ingress are included; 75 GB monthly outbound allowance is assumed unused.",
    ],
  }),
  offer({
    id: "ibm",
    provider: "IBM Cloud",
    product: "Object Storage Standard",
    region: "Regional US South, Dallas (us-south)",
    url: "https://cloud.ibm.com/objectstorage/create",
    s3Evidence:
      "https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-compatibility-api",
    unavailableReason:
      "Current Standard pricing could not be reconciled with the separate legacy order rate card. No legacy rate is used as a current quote.",
  }),
  offer({
    id: "idrive",
    provider: "IDrive",
    product: "e2 Pay-As-You-Go / Annual",
    region: "US East, Virginia",
    url: "https://www.idrive.com/s3-storage-e2/pricing",
    s3Evidence: "https://www.idrive.com/s3-storage-e2/",
    additionalSources: [
      {
        label: "Billing and transfer policy",
        url: "https://support.idrive.com/s3-storage-e2/faq-pricing",
      },
    ],
    pricing: {
      ...metered(0.006, 0.01),
      minimumStorage: 1000,
      freeDownloadMultiple: 3,
      packages: [
        1, 2, 5, 10, 20, 30, 40, 50, 100, 200, 300, 400, 500, 600, 700, 800,
        900, 1000,
      ].map((tb) => ({ capacityGB: tb * 1000, yearly: tb * 59.5 })),
    },
    notes: [
      "Monthly billing has a $6 / 1 TB minimum. Annual plans use regular Standard renewal prices; first-year promotions and Veeam/MSP-only offers are excluded.",
      "Free egress up to 3× stored volume; excess egress at $0.01/GB. API calls and uploads are included.",
    ],
  }),
  offer({
    id: "ionos",
    provider: "IONOS",
    product: "S3 Object Storage",
    region: "Germany, Frankfurt; USD contract",
    url: "https://cloud.ionos.com/prices",
    s3Evidence: "https://cloud.ionos.com/storage/object-storage",
    pricing: {
      ...metered(0.00487),
      unit: "GiB",
      download: {
        free: 2048,
        tiers: [
          { upTo: 10 * 1024, rate: 0.036 },
          { upTo: 50 * 1024, rate: 0.03 },
          { upTo: 150 * 1024, rate: 0.024 },
          { upTo: null, rate: 0.018 },
        ],
      },
    },
    notes: [
      "Uses the standalone Object Storage USD price per 30 days, with binary billing units.",
      "Assumes the shared 2 TiB contract-wide monthly internet transfer allowance is unused. Object Query is excluded.",
    ],
  }),
  offer({
    id: "oracle",
    provider: "Oracle Cloud",
    product: "Object Storage Standard",
    region: "US West, Phoenix (us-phoenix-1)",
    url: "https://www.oracle.com/cloud/price-list/",
    s3Evidence:
      "https://docs.oracle.com/en-us/iaas/Content/Object/Tasks/s3compatibleapi.htm",
    unavailableReason:
      "The full current Standard USD storage, request and outbound rate card was not available for verification.",
  }),
  offer({
    id: "cloudflare",
    provider: "Cloudflare",
    product: "R2 Standard",
    region: "Automatic placement; global Standard rate",
    url: "https://developers.cloudflare.com/r2/pricing/",
    s3Evidence: "https://developers.cloudflare.com/r2/api/s3/api/",
    pricing: {
      ...metered(0),
      storage: flat(0.015, 10, 1),
      writes: {
        per: 1_000_000,
        price: 4.5,
        free: 1_000_000,
        roundTo: 1_000_000,
      },
      reads: {
        per: 1_000_000,
        price: 0.36,
        free: 10_000_000,
        roundTo: 1_000_000,
      },
    },
    notes: [
      "Assumes the 10 GB storage, 1 million Class A and 10 million Class B monthly free allowances are unused.",
      "Billable storage rounds up to GB-months and billable requests to millions. Internet egress is free.",
    ],
  }),
  offer({
    id: "rabata-hot",
    provider: "Rabata.io",
    product: "S3 Hot Storage",
    region: "US endpoint; same published flat rate as EU",
    url: "https://docs.rabata.io/billing/",
    s3Evidence: "https://rabata.io/",
    pricing: metered(0.01, 0.01),
    notes: [
      "Actual daily storage is metered; this estimate keeps the volume constant. The published billing guide lists no additional request charges.",
    ],
  }),
  offer({
    id: "rabata-backup",
    provider: "Rabata.io",
    product: "S3 Backup",
    region: "US endpoint; same published flat rate as EU",
    url: "https://docs.rabata.io/billing/",
    s3Evidence: "https://rabata.io/",
    pricing: {
      ...metered(0),
      storage: flat(49 / 10_000, 0, 10_000),
      downloadLimitMultiple: 2,
    },
    notes: [
      "Storage is billed in 10 TB blocks at $49/block/month. Monthly egress should not exceed 2× stored data.",
    ],
  }),
  offer({
    id: "hetzner",
    provider: "Hetzner",
    product: "Object Storage",
    region: "Germany, Falkenstein (FSN1)",
    url: "https://www.hetzner.com/storage/object-storage/",
    s3Evidence: "https://docs.hetzner.com/storage/object-storage/overview/",
    unavailableReason:
      "Current base and overage prices need confirmation after the 2026 price changes; the outdated CSV rate is not used.",
    notes: [
      "The official billing guide specifies an hourly base bundle, account-wide allowances and a 64 kB minimum billed object size.",
    ],
  }),
  offer({
    id: "contabo",
    provider: "Contabo",
    product: "Object Storage",
    region: "EU, eu2.contabostorage.com",
    url: "https://contabo.com/en/object-storage/",
    s3Evidence: "https://docs.contabo.com/docs/storage/object-storage/",
    unavailableReason:
      "A current complete regional price and transfer policy could not be verified.",
    notes: [
      "Capacity is added in 250 GB increments. The standard object count limit is 3 million; bandwidth and request-rate limits also apply.",
    ],
  }),
  offer({
    id: "storj",
    provider: "Storj",
    product: "Distributed Storage (Standard)",
    region: "Globally distributed Standard tier",
    url: "https://www.storj.io/pricing",
    s3Evidence: "https://storj.dev/dcs/api/s3",
    additionalSources: [
      {
        label: "Pricing rules",
        url: "https://www.storj.io/pricing/change-FAQs/",
      },
    ],
    pricing: {
      ...metered(0.007, 0.007),
      minimumMonthly: 5,
      minimumMonths: 1,
      minimumObjectBytes: 50_000,
    },
    notes: [
      "$5 minimum monthly invoice; 50 KB minimum billed object size; 30-day retention. No API fees.",
      "Uses the Standard tier without Object Mount licenses or legacy segment fees.",
    ],
  }),
  offer({
    id: "mega",
    provider: "MEGA",
    product: "S4 Object Storage (Pro Flexi)",
    region: "Europe, Amsterdam; Pro Flexi EUR list rate",
    url: "https://mega.io/objectstorage",
    s3Evidence: "https://mega.io/objectstorage",
    currency: "EUR",
    pricing: {
      ...metered(0),
      baseMonthly: 15,
      storage: flat(0.0035, 3000),
      downloadLimitMultiple: 5,
    },
    notes: [
      "Pro Flexi includes 3 TB for €15/month, then €3.50 per additional TB. Smaller Pro plans are separate products and are not modeled.",
      "No API fees or minimum retention; free egress policy covers up to 5× average stored data. Prices exclude tax.",
    ],
  }),
  offer({
    id: "telnyx",
    provider: "Telnyx",
    product: "Cloud Storage",
    region: "US, standard Object Storage rate",
    url: "https://telnyx.com/pricing/storage",
    s3Evidence: "https://telnyx.com/pricing/storage",
    pricing: {
      ...metered(0.006),
      unit: "GiB",
      writes: { per: 1_000_000, price: 0.5 },
      reads: { per: 1_000_000, price: 0.04 },
    },
    notes: [
      "Uses the detailed rate-card unit (GiB), with free egress. State-changing and state-reading requests are charged separately.",
      "Embedded storage, enterprise commitments and negotiated volume discounts are excluded.",
    ],
  }),
  ...(["STANDARD", "STANDARD_IA"] as const).map((storageClass) =>
    offer({
      id: storageClass === "STANDARD" ? "zero-standard" : "zero-ia",
      provider: "ZERO",
      product: `Z3 (${storageClass})`,
      region: "Germany; regional quote required",
      url: "https://docs.zeroservices.eu/zero-z3/billing/",
      s3Evidence: "https://docs.zeroservices.eu/zero-z3/",
      unavailableReason:
        "The official billing guide directs current prices to the customer portal. Public CSV rates are not verified current quotes.",
      notes: [
        "1 TB account minimum and 64 KB minimum billed objects; tiered egress. Ingress and requests are included.",
      ],
    }),
  ),
  offer({
    id: "aws-express",
    provider: "AWS",
    product: "S3 Express One Zone",
    region: "US East (N. Virginia), us-east-1",
    url: awsSource,
    s3Evidence:
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-express-differences.html",
    unavailableReason:
      "A complete size-dependent Express request and data-processing model is not yet verified. The storage rate alone would understate costs.",
  }),
  offer({
    id: "azure-premium",
    provider: "Azure",
    product: "Premium Block Blob",
    region:
      "Not priced; region and provisioned configuration need verification",
    url: "https://azure.microsoft.com/en-us/pricing/details/storage/blobs/",
    unavailableReason:
      "Current Premium capacity, transaction and outbound charges could not be verified for a complete configuration.",
  }),
  offer({
    id: "exoscale",
    provider: "Exoscale",
    product: "Simple Object Storage",
    region: "Switzerland, CH-GVA-2",
    url: "https://www.exoscale.com/pricing/",
    s3Evidence: "https://www.exoscale.com/object-storage/",
    unavailableReason:
      "The complete current currency-specific storage and outgoing-traffic rates were not available in the public rate-card output.",
    notes: [
      "The official rate card specifies cumulative storage tiers and a 128 KiB minimum billed object size.",
    ],
  }),
  offer({
    id: "exoscale-archival",
    provider: "Exoscale",
    product: "Simple Object Storage Archival",
    region: "Switzerland, CH-GVA-2; activation on request",
    url: "https://www.exoscale.com/object-storage/classes/",
    s3Evidence: "https://www.exoscale.com/object-storage/",
    unavailableReason:
      "Archival is activated on request and current complete currency-specific pricing needs confirmation; future Warm/Cold classes are not substituted.",
    notes: [
      "The published archival program has a 10 TB minimum per bucket and is distinct from delayed-retrieval cold archives.",
    ],
  }),
  offer({
    id: "xns",
    provider: "XNS",
    product: "Object Storage",
    region: "Customer-selected provider placement; global list rate",
    url: "https://xns.tech/pricing",
    s3Evidence: "https://xns.tech/production-readiness",
    pricing: { ...metered(0.006), minimumMonths: 1 },
    notes: [
      "30-day retention; no metered egress or request charges. Requires operating an on-premise Relayer / S3 gateway; its hardware, hosting and operational costs are excluded.",
    ],
  }),
];

export function offersForPage(page: CalculatorPage) {
  return STORAGE_OFFERS.filter(
    (item) => page === "backup" || Boolean(item.s3Evidence),
  );
}
