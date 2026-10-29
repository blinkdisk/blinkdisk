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
  pricing: StoragePricing;
  reviewedAt?: string;
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
    reviewedAt: input.reviewedAt ?? REVIEWED_AT,
    sources: [
      { label: "Official pricing", url: input.url },
      ...(input.additionalSources ?? []),
    ],
    s3Evidence: input.s3Evidence,
    pricing: input.pricing,
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

const azureSources: StorageOffer["sources"] = [
  {
    label: "Regional USD rate card",
    url: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Storage%27%20and%20armRegionName%20eq%20%27eastus%27%20and%20priceType%20eq%20%27Consumption%27",
  },
  {
    label: "Bandwidth pricing and units",
    url: "https://azure.microsoft.com/en-us/pricing/details/bandwidth/",
  },
  {
    label: "Transaction billing",
    url: "https://learn.microsoft.com/en-us/azure/storage/common/storage-plan-manage-costs",
  },
];
const azureDownload: UsagePrice = {
  free: 100,
  tiers: [
    { upTo: 10100, rate: 0.087 },
    { upTo: 50100, rate: 0.083 },
    { upTo: 150100, rate: 0.07 },
    { upTo: null, rate: 0.05 },
  ],
};
const azureNotes = [
  "East US, locally redundant storage (LRS), flat namespace and Blob REST API. ADLS Gen2, geo-replication, reserved capacity and optional features are excluded.",
  "Storage is billed in GiB; internet egress is billed in decimal GB using Microsoft Global Network routing. Assumes the shared 100 GB monthly outbound allowance is unused.",
];

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
      "AWS storage and transfer use binary GiB, labeled GB on its pricing page; inputs are converted from decimal GB.",
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
    product: "Blob Storage (Hot, LRS)",
    region: "East US (eastus), LRS, flat namespace",
    url: "https://azure.microsoft.com/en-us/pricing/details/storage/blobs/",
    reviewedAt: "2026-10-30",
    additionalSources: azureSources,
    pricing: {
      ...metered(0),
      unit: "GiB",
      downloadUnit: "GB",
      storage: {
        tiers: [
          { upTo: 51200, rate: 0.0208 },
          { upTo: 512000, rate: 0.019968 },
          { upTo: null, rate: 0.019136 },
        ],
      },
      download: azureDownload,
      writes: { per: 10000, price: 0.05 },
      reads: { per: 10000, price: 0.004 },
    },
    notes: azureNotes,
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
    reviewedAt: "2026-10-30",
    pricing: {
      ...metered(0),
      baseMonthly: 18,
      storage: flat(0.018, 1000),
      download: flat(0.01, 1000),
    },
    notes: [
      "$18/month includes 1,000 GB storage and 1,000 GB outbound transfer; excess storage is $0.018/GB and transfer $0.01/GB.",
      "Uses the storage and transfer charges in Vultr’s billing guide, which lists no separate API fees. Ingress is included; Standard throughput limits apply.",
    ],
  }),
  offer({
    id: "linode",
    provider: "Akamai (Linode)",
    product: "Object Storage (Standard E3)",
    region: "Chicago, us-ord; us-ord-10.linodeobjects.com (E3)",
    url: "https://techdocs.akamai.com/cloud-computing/docs/object-storage-pricing",
    s3Evidence:
      "https://techdocs.akamai.com/cloud-computing/docs/endpoint-types",
    reviewedAt: "2026-10-30",
    additionalSources: [
      {
        label: "Billing units",
        url: "https://techdocs.akamai.com/cloud-computing/docs/understanding-how-billing-works",
      },
      {
        label: "Endpoint quotas",
        url: "https://techdocs.akamai.com/cloud-computing/docs/object-storage-product-limits",
      },
    ],
    pricing: {
      ...metered(0),
      unit: "GiB",
      baseMonthly: 5,
      storage: flat(0.02, 250),
      download: flat(0.005, 1024),
      writes: { per: 1000, price: 0.005, free: 1000000 },
      reads: { per: 1000, price: 0.0004, free: 12500000 },
      maximumStorageGB: 500 * 1024 * (2 ** 30 / 1e9),
      maximumObjects: 500000000,
    },
    notes: [
      "$5/month includes 250 GiB storage. Assumes the account’s pooled 1 TiB monthly transfer allowance is unused.",
      "Models the published E2/E3 request schedule: 1 million writes and 12.5 million reads free each month. Akamai announced billing no earlier than October 1, 2026; if not yet enabled on your account, actual request charges may be lower.",
      "Uses the standard Chicago E3 endpoint, not legacy Newark endpoints or special regional rates. Default account quotas apply; increases require approval.",
    ],
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
    product: "Object Storage Standard (Regional)",
    region: "Regional US South, Dallas (us-south)",
    url: "https://cloud.ibm.com/objectstorage/create",
    s3Evidence:
      "https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-compatibility-api",
    reviewedAt: "2026-10-30",
    additionalSources: [
      {
        label: "Regional order rate card",
        url: "https://orders.cloud.ibm.com/Store/orderService/objectStorage",
      },
      {
        label: "Billing rules",
        url: "https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-billing",
      },
    ],
    pricing: {
      ...metered(0),
      unit: "GiB",
      storage: {
        tiers: [
          { upTo: 500 * 1024, rate: 0.023 },
          { upTo: null, rate: 0.0209 },
        ],
      },
      download: {
        tiers: [
          { upTo: 50 * 1024, rate: 0.09 },
          { upTo: 150 * 1024, rate: 0.07 },
          { upTo: 500 * 1024, rate: 0.05 },
          { upTo: null, rate: 0.05 },
        ],
      },
      writes: { per: 1000, price: 0.0052 },
      reads: { per: 10000, price: 0.0042 },
      maximumDownloadGB: 500 * 1024 * (2 ** 30 / 1e9),
    },
    notes: [
      "Standard storage class under the pay-as-you-go Standard plan, with Regional US South rates. No minimum object size, retention or retrieval fee.",
      "Smart Tier’s introductory free tier, One-Rate plans and promotional discounts are excluded. Public egress above 500 TiB/month requires a quote.",
    ],
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
    region: "US West, Phoenix (us-phoenix-1); North America egress",
    url: "https://www.oracle.com/cloud/price-list/",
    s3Evidence:
      "https://docs.oracle.com/en-us/iaas/Content/Object/Tasks/s3compatibleapi.htm",
    reviewedAt: "2026-10-30",
    additionalSources: [
      {
        label: "Public USD rate feed (B91628, B91627, B88327)",
        url: "https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/",
      },
      {
        label: "Billing units",
        url: "https://www.oracle.com/contracts/docs/paas-iaas-public-cloud-2140609.pdf",
      },
    ],
    pricing: {
      ...metered(0),
      unit: "GiB",
      storage: flat(0.0255, 10),
      download: flat(0.0085, 10240),
      requests: { per: 10000, price: 0.0034, free: 50000 },
    },
    notes: [
      "Assumes the recurring 10 GiB storage, 50,000 combined API requests and 10 TiB outbound allowances are unused. Signup credits are excluded.",
      "The request allowance is shared by uploads and downloads, and resets monthly. Standard has no separate retrieval charge.",
    ],
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
    reviewedAt: "2026-10-30",
    currency: "EUR",
    pricing: {
      ...metered(0),
      baseMonthly: 6.49,
      storage: flat((0.0087 * 720) / 1000, 1000, 0.1),
      download: flat(1 / 1000, 1080, 0.1),
      minimumObjectBytes: 64000,
    },
    notes: [
      "Uses a 30-day (720-hour) reference month: €6.49 base includes 1 TB-hour of storage per hour and 0.0015 TB of outbound traffic per hour (1.08 TB/month). Shared allowances are assumed unused.",
      "Extra storage is €0.0087/TB-hour and outbound traffic €1/TB, billed in 100 MB increments; 64 kB minimum billed object size. Requests and ingress are included. Calendar-month totals vary with hours.",
    ],
  }),
  offer({
    id: "contabo",
    provider: "Contabo",
    product: "Object Storage",
    region: "EU, eu2.contabostorage.com",
    url: "https://contabo.com/en/object-storage/",
    s3Evidence: "https://docs.contabo.com/docs/storage/object-storage/",
    reviewedAt: "2026-10-30",
    currency: "EUR",
    additionalSources: [
      {
        label: "Included traffic and requests",
        url: "https://contabo.com/blog/introducing-all-inclusive-object-storage/",
      },
    ],
    pricing: {
      ...metered(0),
      storage: flat(2.49 / 250, 0, 250),
      maximumObjects: 3000000,
    },
    notes: [
      "Available exclusively to existing Contabo customers; this estimate assumes an eligible account. Capacity costs €2.49 per started 250 GB/month, before tax.",
      "Traffic, ingress and API calls are included. The standard account limit is 3 million objects; throughput and request-rate limits apply.",
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
      region: "Germany; European public list rate",
      url: "https://lp.zeroservices.eu/zero-z3",
      s3Evidence: "https://docs.zeroservices.eu/zero-z3/",
      reviewedAt: "2026-10-30",
      currency: "EUR",
      additionalSources: [
        {
          label: "Billing rules",
          url: "https://docs.zeroservices.eu/zero-z3/billing/",
        },
      ],
      pricing: {
        ...metered((storageClass === "STANDARD" ? 60 : 7.5) / 1000),
        minimumStorage: 1000,
        minimumObjectBytes: 64000,
        download: {
          tiers: [
            { upTo: 100000, rate: 5 / 1000 },
            { upTo: 1000000, rate: 3 / 1000 },
            { upTo: null, rate: 2 / 1000 },
          ],
        },
      },
      notes: [
        "1 TB account minimum and 64 KB minimum billed objects. STANDARD uses the public NVMe rate; STANDARD_IA is immediately accessible HDD storage.",
        "Cumulative egress tiers: €5/TB for the first 100 TB, €3/TB up to 1 PB, then €2/TB. Ingress and API requests are included; negotiated enterprise discounts are excluded.",
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
    reviewedAt: "2026-10-30",
    additionalSources: [
      {
        label: "US East regional USD rate card",
        url: "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json",
      },
      {
        label: "April 2025 pricing changes",
        url: "https://aws.amazon.com/blogs/aws/up-to-85-price-reductions-for-amazon-s3-express-one-zone/",
      },
    ],
    pricing: {
      ...metered(0.11),
      unit: "GiB",
      download: awsDownload,
      upload: flat(0.0032),
      retrieval: flat(0.0006),
      writes: { per: 1000, price: 0.00113 },
      reads: { per: 1000, price: 0.00003 },
    },
    notes: [
      "Single Availability Zone directory bucket. Since April 10, 2025, upload and retrieval processing apply to all bytes; the former 512 KB threshold no longer applies.",
      "Includes initial upload processing, recurring retrieval processing, requests and public internet egress. Assumes the AWS account-wide 100 GiB monthly outbound allowance is unused.",
    ],
  }),
  offer({
    id: "azure-premium",
    provider: "Azure",
    product: "Premium Block Blob (LRS)",
    region: "East US (eastus), LRS, flat namespace",
    url: "https://azure.microsoft.com/en-us/pricing/details/storage/blobs/",
    reviewedAt: "2026-10-30",
    additionalSources: azureSources,
    pricing: {
      ...metered(0.15),
      unit: "GiB",
      downloadUnit: "GB",
      download: azureDownload,
      writes: { per: 10000, price: 0.0175 },
      reads: { per: 10000, price: 0.0014 },
    },
    notes: [
      ...azureNotes,
      "Premium Block Blob uses actual stored capacity, not a provisioned managed-disk or page-blob tariff. No separate retrieval fee is charged.",
    ],
  }),
  offer({
    id: "exoscale",
    provider: "Exoscale",
    product: "Simple Object Storage Standard",
    region: "Switzerland, CH-GVA-2",
    url: "https://www.exoscale.com/pricing/",
    s3Evidence: "https://www.exoscale.com/object-storage/",
    reviewedAt: "2026-10-30",
    additionalSources: [
      {
        label: "Public USD rate feed",
        url: "https://portal.exoscale.com/api/pricing/sos",
      },
    ],
    pricing: {
      ...metered(0),
      unit: "GiB",
      storage: {
        tiers: [
          { upTo: 512 * 1024, rate: 0.0000275 * 730 },
          { upTo: 1024 * 1024, rate: 0.00001875 * 730 },
          { upTo: null, rate: 0.00001389 * 730 },
        ],
      },
      download: flat(0.02),
      minimumObjectBytes: 128 * 1024,
    },
    notes: [
      "730 hours per reference month; cumulative storage tiers at 512 TiB and 1 PiB. Objects have a 128 KiB minimum billed size.",
      "USD rates from the public pricing feed. API requests, ingress and Standard retrieval are included; outbound traffic costs $0.02/GiB.",
    ],
  }),
  offer({
    id: "exoscale-archival",
    provider: "Exoscale",
    product: "Simple Object Storage Archival",
    region: "Switzerland, CH-GVA-2; approved archival bucket",
    url: "https://www.exoscale.com/object-storage/classes/",
    s3Evidence: "https://www.exoscale.com/object-storage/",
    reviewedAt: "2026-10-30",
    currency: "EUR",
    additionalSources: [
      {
        label: "Public traffic rate feed",
        url: "https://portal.exoscale.com/api/pricing/sos",
      },
    ],
    pricing: {
      ...metered(0.00000626 * 730, 0.02),
      unit: "GiB",
      minimumStorage: 9313,
      minimumObjectBytes: 128 * 1024,
    },
    notes: [
      "Assumes one approved archival bucket and the discount active from the first full billing month. Minimum 10 TB per bucket, metered as 9,313 GiB; 730 hours per estimated month. Initial partial-month Standard charges are excluded.",
      "Currently immediate S3 access with no retrieval fee or minimum retention; outbound traffic is €0.02/GiB. Object lock is unavailable.",
      "This is the current Archival tariff held constant for comparison. Exoscale plans replacement classes in early 2027; migration or reversion to Standard will change future bills. Hot workloads require Standard.",
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

export const UPDATED_AT = STORAGE_OFFERS.reduce(
  (latest, item) => (item.reviewedAt > latest ? item.reviewedAt : latest),
  REVIEWED_AT,
);

export function offersForPage(page: CalculatorPage) {
  return STORAGE_OFFERS.filter(
    (item) => page === "backup" || Boolean(item.s3Evidence),
  );
}
