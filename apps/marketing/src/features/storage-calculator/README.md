# Storage calculators

The backup and S3 routes share `calculate.ts`, typed offers and query-state handling. Page-specific copy and field visibility live in `pages.ts` and the page component. The S3 offer list requires an official `s3Evidence` URL; native Azure and CloudBlink are excluded.

## Pricing snapshot

The starting selection is the 30 products in [S3Compare's CSV](https://github.com/zeroservices/s3compare.io_data), plus CloudBlink. The CSV's prices, performance scores, region lists and ambiguous `Steps` column are not used as authoritative billing rules. The initial review was on 2026-10-29; the 13 previously incomplete reference tariffs were completed on 2026-10-30. Each record links the official sources used and its own review date. Every offer requires a tariff and must produce a finite estimate for the default scenario. Missing research is not a reason to ship a placeholder row.

Some original product names now refer to a more specific current offer: OVH uses Multi Zone Standard, Linode is Akamai Object Storage, Storj uses Standard, and MEGA uses Pro Flexi. Regional quotes, legacy prices and introductory discounts are not interchangeable with current regular list prices.

EUR conversion is fixed to the [ECB reference rate](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html), EUR 1 = USD 1.113 on 2026-10-29. Change the value, date and source together. Provider-native rates stay in their original currency until the final cost breakdown is converted to USD.

## Refreshing prices

Review monthly and before promoting the calculators:

1. Open every offer's official pricing, billing-policy and API documentation. Confirm region, tax basis, regular renewal prices, base-2 versus base-10 units, requests, ingress, egress, retrieval, recurring free allowances, billing increments and minimum commitments. Check for new terms or discontinued offers.
2. Update the affected offer's `reviewedAt`, sources and tariff together. `UPDATED_AT` reflects the newest individual review, not a claim that every rate was checked that day. Resolve missing tariff details from official pricing feeds or an explicitly selected reference configuration before publishing. Do not add `s3Evidence` based on third-party comparison sites.
3. Check the current CloudBlink plans in `@blinkdisk/constants/plans`, and its per-vault egress policy in `apps/cloud/src/events/get.ts` and the 30-day reset in `apps/cloud/src/utils/alarm.ts`. The calculator models one constant-sized vault. Regular prices never subtract the trial.
4. Verify a small-storage case, the default scenario and a download-heavy case against official rate-card arithmetic. Add regression cases for changed billing rules. Run the marketing tests, type check and build.

## Calculation boundaries

Inputs use decimal GB/TB and MB. Each offer declares its billing unit. Tier thresholds are cumulative usage boundaries before deducting any free allowance. `storage.roundTo` rounds the total billable volume, while `minimumObjectBytes` rounds each representative object separately. `minimumStorage` is an active-storage minimum, not a capacity block; blocks use `roundTo`. `minimumMonthly` is a floor on the whole monthly invoice. `requests` is a shared monthly upload/download request pool; `writes` and `reads` have independent allowances. Initial uploads share the first month's pool; subsequent months contain downloads only.

The model uploads the repository once, holds a constant volume and repeats the specified downloads each month. Object count is rounded up, with a partial final object. It estimates one PUT per initial object and one GET per downloaded object. It does not estimate LIST/HEAD requests, retries, multipart overhead, changing data, compression, versioning, replicas or external software/infrastructure costs. Object size is representative, not a model of a distribution of tiny and large objects.

Annual packages incur whole-year charges. Minimum retention after deletion charges the actual billable objects, not repeated active-account minimum charges. Monthly invoice floors are applied separately to the initial month (which includes upload/write costs) and subsequent months.

## Reference tariffs completed on 2026-10-30

The official source links live alongside each offer in `offers.ts`. Rates below are native currency before the fixed EUR conversion. These are manually maintained snapshots; the public feeds are research sources, not runtime dependencies or automated imports.

| Offer | Reference and billing rules |
| --- | --- |
| Azure Hot | East US, General Block Blob v2, Hot LRS, flat namespace. Storage $0.0208/$0.019968/$0.019136 per GiB-month at 50/500 TiB boundaries; write $0.05/10K, read $0.004/10K. Rates come from the Retail Prices API. |
| Azure Premium | East US, Premium Block Blob, Premium LRS, flat namespace: $0.15/GiB-month, write $0.0175/10K, read $0.0014/10K. This is not provisioned page-blob capacity. |
| Azure egress | Microsoft Global Network routing, first 100 GiB free. Retail meter tier starts: 100/10,335/51,295/153,695 GiB, rates $0.087/$0.083/$0.07/$0.05. Blob REST requests are per operation; the ADLS Gen2 4 MiB transaction model does not apply. |
| Vultr Standard | $18/month includes 1,000 GB stored and outbound; overages $0.018/GB stored and $0.01/GB outbound. The complete billing guide lists storage and outbound charges, with no additional request fee. |
| Akamai E3 | Chicago `us-ord-10.linodeobjects.com`, binary units. $5 includes 250 GiB; excess $0.02/GiB. Pooled 1 TiB transfer free, excess $0.005/GiB. Published E2/E3 writes $0.005/1K after 1M/month and reads $0.0004/1K after 12.5M/month are modeled explicitly. The announced earliest activation date is October 1, 2026; the row explains that accounts not yet billed may pay less. |
| IBM Standard | Regional US South, Standard pay-as-you-go plan/class. $0.023/GiB-month through 500 TiB, then $0.0209. Class A $0.0052/1K; B $0.0042/10K. Egress $0.09/$0.07/$0.05 at cumulative 50/150/500 TiB thresholds; larger egress requires a quote. No Smart Tier introductory allowances or One-Rate promotion. |
| Oracle Standard | Phoenix, USD SKUs B91628 (storage), B91627 (requests), B88327 (North America outbound). $0.0255/GiB-month after 10 GiB; $0.0034/10K combined requests after 50K/month; $0.0085/GiB outbound after 10 TiB/month. Values and free ranges from Oracle's public product-price feed. |
| Hetzner | FSN1, EUR, 720-hour reference month. €6.49 base includes 1 TB-hour/hour and 0.0015 TB outbound/hour (1.08 TB/month). Extra storage €0.0087/TB-hour; egress €1/TB. Total usage rounds to 100 MB increments; each object has a 64 kB minimum. |
| Contabo | EU, existing customers only. €2.49 per started 250 GB/month. Requests and traffic included; standard quota 3M objects. Account eligibility is stated in the row. |
| ZERO STANDARD / STANDARD_IA | Public European rates €60/€7.50 per decimal TB-month, minimum 1 TB/account and 64 KB/object. Cumulative egress €5/TB through 100 TB, €3/TB through 1 PB, then €2/TB. Requests and ingress included. |
| Exoscale Standard | CH-GVA-2, USD public pricing feed. $0.00002750/$0.00001875/$0.00001389 per GiB-hour at 512 TiB/1 PiB, using 730 hours. Egress $0.02/GiB; 128 KiB/object minimum. |
| Exoscale Archival | Approved CH-GVA-2 bucket, discount active for the first full month. €0.00000626/GiB-hour, 730 hours, minimum 9,313 GiB/bucket, egress €0.02/GiB. Current retrieval is free and immediate. The row states approval, the excluded initial partial month and the planned 2027 migration; the estimate holds today's tariff constant. |
| AWS S3 Express | N. Virginia public S3 rate feed: $0.11/GiB-month, PUT $0.00113/1K, GET $0.00003/1K, upload processing $0.0032/GiB and retrieval $0.0006/GiB, plus normal internet egress. Since April 10, 2025, processing applies to all bytes, including objects below 512 KB. |

All changed calculator state is stored in query parameters. Unknown parameters such as UTM tags are retained. The canonical URL always points to the route without parameters. Server rendering uses defaults; browser URL state is applied after hydration. `calculator=backup|s3` on download CTAs, with a session-storage fallback, attributes existing `download_started` events to the calculator.
