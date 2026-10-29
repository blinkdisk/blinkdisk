# Storage calculators

The backup and S3 routes share `calculate.ts`, typed offers and query-state handling. Page-specific copy and field visibility live in `pages.ts` and the page component. The S3 offer list requires an official `s3Evidence` URL; native Azure and CloudBlink are excluded.

## Pricing snapshot

The starting selection is the 30 products in [S3Compare's CSV](https://github.com/zeroservices/s3compare.io_data), plus CloudBlink. The CSV's prices, performance scores, region lists and ambiguous `Steps` column are not used as authoritative billing rules. Prices and policies were checked against provider sources on 2026-10-29. Each record links the sources used. A missing `pricing` field means the full tariff is not verified; keep its reason visible rather than substituting the old CSV rate.

Some original product names now refer to a more specific current offer: OVH uses Multi Zone Standard, Linode is Akamai Object Storage, Storj uses Standard, and MEGA uses Pro Flexi. Regional quotes, legacy prices and introductory discounts are not interchangeable with current regular list prices.

EUR conversion is fixed to the [ECB reference rate](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html), EUR 1 = USD 1.113 on 2026-10-29. Change the value, date and source together. Provider-native rates stay in their original currency until the final cost breakdown is converted to USD.

## Refreshing prices

Review monthly and before promoting the calculators:

1. Open every offer's official pricing, billing-policy and API documentation. Confirm region, tax basis, regular renewal prices, base-2 versus base-10 units, requests, ingress, egress, retrieval, recurring free allowances, billing increments and minimum commitments. Check for new terms or discontinued offers.
2. Update the affected offer's `reviewedAt`, sources and tariff together. The page-level review date should only advance after reviewing the whole selection. For incomplete tariffs, retain the offer without a price and explain the specific missing information. Do not add `s3Evidence` based on third-party comparison sites.
3. Check the current CloudBlink plans in `@blinkdisk/constants/plans`, and its per-vault egress policy in `apps/cloud/src/events/get.ts` and the 30-day reset in `apps/cloud/src/utils/alarm.ts`. The calculator models one constant-sized vault. Regular prices never subtract the trial.
4. Verify a small-storage case, the default scenario and a download-heavy case against official rate-card arithmetic. Add regression cases for changed billing rules. Run the marketing tests, type check and build.

## Calculation boundaries

Inputs use decimal GB/TB and MB. Each offer declares its billing unit. Tier thresholds are cumulative usage boundaries before deducting any free allowance. `storage.roundTo` rounds the total billable volume, while `minimumObjectBytes` rounds each representative object separately. `minimumStorage` is an active-storage minimum, not a capacity block; blocks use `roundTo`. `minimumMonthly` is a floor on the whole monthly invoice.

The model uploads the repository once, holds a constant volume and repeats the specified downloads each month. Object count is rounded up, with a partial final object. It estimates one PUT per initial object and one GET per downloaded object. It does not estimate LIST/HEAD requests, retries, multipart overhead, changing data, compression, versioning, replicas or external software/infrastructure costs. Object size is representative, not a model of a distribution of tiny and large objects.

Annual packages incur whole-year charges. Minimum retention after deletion charges the actual billable objects, not repeated active-account minimum charges. Monthly invoice floors are applied separately to the initial month (which includes upload/write costs) and subsequent months.

All changed calculator state is stored in query parameters. Unknown parameters such as UTM tags are retained. The canonical URL always points to the route without parameters. Server rendering uses defaults; browser URL state is applied after hydration. `calculator=backup|s3` on download CTAs, with a session-storage fallback, attributes existing `download_started` events to the calculator.
