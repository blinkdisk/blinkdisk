import {
  calculateOffer,
  calculateOffers,
  usageCost,
} from "@marketing/features/storage-calculator/calculate";
import {
  offersForPage,
  STORAGE_OFFERS,
} from "@marketing/features/storage-calculator/offers";
import StorageCalculator from "@marketing/features/storage-calculator/StorageCalculator";
import { defaultState } from "@marketing/features/storage-calculator/state";
import type {
  CalculatorState,
  StorageOffer,
  StoragePricing,
} from "@marketing/features/storage-calculator/types";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

const scenario = (changes: Partial<CalculatorState> = {}) => ({
  ...defaultState("backup"),
  ...changes,
});
const fixture = (pricing: Partial<StoragePricing> = {}): StorageOffer => ({
  id: "example",
  provider: "Example",
  product: "Storage",
  region: "Example region",
  currency: "USD",
  exchangeRate: 1,
  reviewedAt: "2026-10-29",
  sources: [{ label: "Price", url: "https://example.com/prices" }],
  notes: [],
  pricing: {
    unit: "GB",
    storage: { tiers: [{ upTo: null, rate: 0.01 }] },
    download: { tiers: [{ upTo: null, rate: 0 }] },
    ...pricing,
  },
});
function actual(id: string) {
  const offer = STORAGE_OFFERS.find((item) => item.id === id);
  if (!offer) throw new Error(`Missing offer ${id}`);
  return offer;
}

describe("storage cost calculations", () => {
  it("charges one initial upload and write, but repeats monthly downloads and reads", () => {
    const result = calculateOffer(
      fixture({
        upload: { tiers: [{ upTo: null, rate: 0.02 }] },
        download: { tiers: [{ upTo: null, rate: 0.03 }] },
        retrieval: { tiers: [{ upTo: null, rate: 0.04 }] },
        writes: { per: 1000, price: 1 },
        reads: { per: 1000, price: 0.5 },
      }),
      scenario({ months: 3, downloads: 0.1 }),
    );
    expect(result.objects).toBe(50_000);
    expect(result.costs).toEqual({
      storage: 30,
      upload: 20,
      download: 9,
      retrieval: 12,
      requests: 57.5,
      minimum: 0,
      commitment: 0,
    });
    expect(result.total).toBe(128.5);
  });
  it("applies free usage within cumulative tier boundaries", () => {
    expect(
      usageCost(250, {
        free: 50,
        tiers: [
          { upTo: 100, rate: 1 },
          { upTo: 200, rate: 0.5 },
          { upTo: null, rate: 0.1 },
        ],
      }),
    ).toBe(105);
    expect(
      usageCost(20, {
        free: 50,
        roundTo: 100,
        tiers: [{ upTo: null, rate: 1 }],
      }),
    ).toBe(0);
  });
  it("does not confuse minimum active storage with a minimum invoice or deleted-storage retention", () => {
    const result = calculateOffer(
      fixture({ minimumStorage: 1000, minimumMonths: 3 }),
      scenario({ storage: 100, storageUnit: "GB", months: 1 }),
    );
    expect(result.costs.storage).toBe(10);
    expect(result.costs.commitment).toBe(2);
    expect(result.total).toBe(12);
  });
  it("applies the invoice minimum per month after one-time write charges", () => {
    const result = calculateOffer(
      fixture({ minimumMonthly: 5, writes: { per: 1000, price: 1 } }),
      scenario({ storage: 1, storageUnit: "GB", objectSize: 1, months: 2 }),
    );
    expect(result.costs.requests).toBe(1);
    expect(result.costs.minimum).toBeCloseTo(8.98);
    expect(result.total).toBeCloseTo(10);
  });
  it("uses actual bytes for a partial last object, while applying minimum object charges", () => {
    const result = calculateOffer(
      fixture({ minimumObjectBytes: 1_000_000 }),
      scenario({
        storage: 0.0015,
        storageUnit: "GB",
        objectSize: 0.5,
        months: 1,
      }),
    );
    expect(result.objects).toBe(3);
    expect(result.costs.storage).toBeCloseTo(0.00003);
    const partial = calculateOffer(
      fixture({ minimumObjectBytes: 750_000 }),
      scenario({
        storage: 0.0015,
        storageUnit: "GB",
        objectSize: 1,
        months: 1,
      }),
    );
    expect(partial.costs.storage).toBeCloseTo(0.0000175);
  });
  it("converts decimal input bytes to binary provider units", () => {
    const result = calculateOffer(
      fixture({ unit: "GiB" }),
      scenario({ storage: 1.073741824, storageUnit: "GB", months: 1 }),
    );
    expect(result.costs.storage).toBeCloseTo(0.01);
  });
  it("converts every cost component using the documented exchange rate", () => {
    const offer = {
      ...fixture({ upload: { tiers: [{ upTo: null, rate: 0.01 }] } }),
      currency: "EUR" as const,
      exchangeRate: 1.113,
    };
    const result = calculateOffer(offer, scenario({ months: 1 }));
    expect(result.costs.storage).toBeCloseTo(11.13);
    expect(result.costs.upload).toBeCloseTo(11.13);
    expect(result.total).toBeCloseTo(22.26);
  });
  it("charges complete annual packages, including additional committed months", () => {
    const pricing = fixture({
      packages: [{ capacityGB: 1000, monthly: 12, yearly: 108 }],
    });
    const oneMonth = calculateOffer(
      pricing,
      scenario({ months: 1, billing: "yearly" }),
    );
    expect(oneMonth.costs.storage).toBe(9);
    expect(oneMonth.costs.commitment).toBe(99);
    expect(oneMonth.total).toBe(108);
    expect(
      calculateOffer(pricing, scenario({ months: 13, billing: "yearly" }))
        .total,
    ).toBe(216);
    expect(calculateOffer(pricing, scenario({ months: 1 })).total).toBe(12);
  });
  it("uses annual packages only when that billing option has published packages", () => {
    const result = calculateOffer(
      fixture({ packages: [{ capacityGB: 1000, yearly: 60 }] }),
      scenario({ months: 1 }),
    );
    expect(result.total).toBe(10);
  });
  it("rejects invalid numerical scenarios without leaking NaN into prices", () => {
    for (const input of [
      { storage: 0 },
      { storage: Number.NaN },
      { objectSize: 0 },
      { months: 1.5 },
      { downloads: -1 },
    ]) {
      expect(calculateOffer(fixture(), scenario(input)).total).toBeNull();
    }
  });
  it("enforces documented object and capacity limits", () => {
    expect(
      calculateOffer(fixture({ maximumObjects: 49_999 }), scenario()).total,
    ).toBeNull();
    expect(
      calculateOffer(fixture({ maximumStorageGB: 999 }), scenario()).total,
    ).toBeNull();
  });
});

describe("verified provider examples", () => {
  it("calculates R2 recurring allowances and whole-million request rounding", () => {
    const result = calculateOffer(
      actual("cloudflare"),
      scenario({ months: 1, objectSize: 0.5 }),
    );
    expect(result.objects).toBe(2_000_000);
    expect(result.costs.storage).toBe(14.85);
    expect(result.costs.requests).toBe(4.5);
    expect(result.total).toBe(19.35);
    expect(
      calculateOffer(
        actual("cloudflare"),
        scenario({
          months: 1,
          storage: 1000.001,
          storageUnit: "GB",
          objectSize: 0.5,
        }),
      ).costs.requests,
    ).toBe(9);
  });
  it("charges Rabata Backup per started 10 TB, not per GB with a 10 TB minimum", () => {
    expect(
      calculateOffer(actual("rabata-backup"), scenario({ months: 1 })).total,
    ).toBe(49);
    expect(
      calculateOffer(
        actual("rabata-backup"),
        scenario({ months: 1, storage: 10.001 }),
      ).total,
    ).toBe(98);
  });
  it("charges MEGA’s base bundle before its incremental rate", () => {
    expect(
      calculateOffer(actual("mega"), scenario({ months: 1, storage: 10 }))
        .total,
    ).toBeCloseTo(39.5 * 1.113);
  });
  it("separates Glacier Instant Retrieval fees from internet transfer", () => {
    const result = calculateOffer(
      actual("aws-glacier-instant"),
      scenario({ months: 1, downloads: 1 }),
    );
    expect(result.costs.retrieval).toBeCloseTo((1000 / (2 ** 30 / 1e9)) * 0.03);
    expect(result.costs.download).toBeCloseTo(
      (1000 / (2 ** 30 / 1e9) - 100) * 0.09,
    );
    expect(result.costs.commitment).toBeCloseTo(result.costs.storage * 2);
  });
  it("includes the DigitalOcean GiB bundle and transfer allowance", () => {
    const result = calculateOffer(
      actual("digitalocean"),
      scenario({
        months: 1,
        storage: 250 * (2 ** 30 / 1e9),
        storageUnit: "GB",
        downloads: 1024 * (2 ** 30 / 1e9),
        downloadUnit: "GB",
      }),
    );
    expect(result.total).toBeCloseTo(5);
  });
  it("applies Backblaze’s storage-multiple allowance to each month", () => {
    const result = calculateOffer(
      actual("backblaze"),
      scenario({ months: 2, downloads: 4 }),
    );
    expect(result.costs.download).toBe(20);
    expect(result.total).toBeCloseTo(33.9);
  });
  it("honors Wasabi’s binary minimum and egress policy", () => {
    expect(
      calculateOffer(actual("wasabi"), scenario({ months: 1 })).costs.storage,
    ).toBeCloseTo(7.99);
    expect(
      calculateOffer(actual("wasabi"), scenario({ downloads: 1.001 })).total,
    ).toBeNull();
  });
  it("selects CloudBlink tiers and never extrapolates beyond 10 TB", () => {
    expect(
      calculateOffer(
        actual("cloudblink"),
        scenario({ months: 1, storage: 200, storageUnit: "GB" }),
      ).total,
    ).toBe(4);
    expect(
      calculateOffer(
        actual("cloudblink"),
        scenario({ months: 1, storage: 200.001, storageUnit: "GB" }),
      ).total,
    ).toBe(8);
    expect(
      calculateOffer(actual("cloudblink"), scenario({ months: 1, storage: 10 }))
        .total,
    ).toBe(66);
    expect(
      calculateOffer(actual("cloudblink"), scenario({ storage: 10.001 })).total,
    ).toBeNull();
  });
  it("enforces CloudBlink’s 5× download limit and 1 GB minimum", () => {
    expect(
      calculateOffer(actual("cloudblink"), scenario({ downloads: 5 })).total,
    ).not.toBeNull();
    expect(
      calculateOffer(actual("cloudblink"), scenario({ downloads: 5.001 }))
        .total,
    ).toBeNull();
    expect(
      calculateOffer(
        actual("cloudblink"),
        scenario({
          storage: 0.1,
          storageUnit: "GB",
          downloads: 1,
          downloadUnit: "GB",
        }),
      ).total,
    ).not.toBeNull();
    expect(
      calculateOffer(
        actual("cloudblink"),
        scenario({
          storage: 0.1,
          storageUnit: "GB",
          downloads: 1.001,
          downloadUnit: "GB",
        }),
      ).total,
    ).toBeNull();
  });
});

describe("page eligibility and complete offer selection", () => {
  it("retains all 30 upstream offers and CloudBlink, without silently dropping unverifiable offers", () => {
    expect(STORAGE_OFFERS).toHaveLength(31);
    expect(new Set(STORAGE_OFFERS.map((offer) => offer.id)).size).toBe(31);
    for (const offer of STORAGE_OFFERS) {
      expect(offer.sources.length).toBeGreaterThan(0);
      expect(Boolean(offer.pricing) !== Boolean(offer.unavailableReason)).toBe(
        true,
      );
    }
  });
  it("excludes native Azure and CloudBlink from S3 results", () => {
    expect(offersForPage("backup")).toHaveLength(31);
    const s3 = offersForPage("s3");
    expect(
      s3.some((offer) =>
        ["cloudblink", "azure-hot", "azure-premium"].includes(offer.id),
      ),
    ).toBe(false);
    expect(s3.every((offer) => offer.s3Evidence?.startsWith("https://"))).toBe(
      true,
    );
  });
  it("puts unavailable offers after valid prices even in provider order", () => {
    for (const sort of ["cost", "provider"] as const) {
      const results = calculateOffers(STORAGE_OFFERS, scenario({ sort }));
      const firstUnavailable = results.findIndex(
        (result) => result.total === null,
      );
      expect(
        results
          .slice(firstUnavailable)
          .every((result) => result.total === null),
      ).toBe(true);
      expect(
        results
          .slice(0, firstUnavailable)
          .every((result) => Number.isFinite(result.total)),
      ).toBe(true);
    }
  });
  it("server-renders default results and source details without browser globals", () => {
    const backup = renderToStaticMarkup(
      createElement(StorageCalculator, {
        page: "backup",
        offers: offersForPage("backup"),
      }),
    );
    const s3 = renderToStaticMarkup(
      createElement(StorageCalculator, {
        page: "s3",
        offers: offersForPage("s3"),
      }),
    );
    expect(backup).toContain("CloudBlink");
    expect(backup).toContain("Sources reviewed");
    expect(backup).toContain("Total for 12 mo.");
    expect(s3).not.toContain("CloudBlink");
    expect(s3).not.toContain(">Advanced<");
  });
});
