import { calculateOffers } from "@marketing/features/storage-calculator/calculate";
import {
  defaultState,
  MAX_MONTHS,
  MAX_STORAGE,
  readState,
  writeState,
} from "@marketing/features/storage-calculator/state";
import type {
  CalculationResult,
  CalculatorPage,
  CalculatorState,
  CostBreakdown,
  StorageOffer,
} from "@marketing/features/storage-calculator/types";
import { ChevronDownIcon, RotateCcwIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const money = (amount: number) =>
  amount > 0 && amount < 0.01
    ? "<$0.01"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
const fieldClass =
  "bg-background focus-visible:outline-primary h-12 min-w-0 rounded-xl border px-3 text-base outline-offset-2";
const costLabels: Record<keyof CostBreakdown, string> = {
  storage: "Storage during your period",
  upload: "Initial upload transfer",
  download: "Internet downloads",
  retrieval: "Data retrieval",
  requests: "Upload + download requests",
  minimum: "Minimum invoice adjustment",
  commitment: "Additional committed storage",
};

function NumberField({
  label,
  value,
  min,
  max,
  integer = false,
  onChange,
  unit,
  onUnitChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  integer?: boolean;
  onChange: (value: number) => void;
  unit?: "GB" | "TB";
  onUnitChange?: (value: "GB" | "TB") => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const number = Number(draft);
  const valid =
    draft.trim() !== "" &&
    Number.isFinite(number) &&
    number >= min &&
    number <= max &&
    (!integer || Number.isInteger(number));
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type="number"
          inputMode={integer ? "numeric" : "decimal"}
          min={min}
          max={max}
          step={integer ? 1 : "any"}
          value={draft}
          required
          aria-invalid={!valid}
          aria-describedby={!valid ? `${id}-error` : undefined}
          className={`${fieldClass} w-full tabular-nums`}
          onChange={(event) => {
            const raw = event.target.value;
            setDraft(raw);
            const next = Number(raw);
            if (
              raw !== "" &&
              Number.isFinite(next) &&
              next >= min &&
              next <= max &&
              (!integer || Number.isInteger(next))
            )
              onChange(next);
          }}
          onBlur={() => {
            if (!valid) setDraft(String(value));
          }}
        />
        {unit && onUnitChange && (
          <select
            aria-label={`${label} unit`}
            className={`${fieldClass} w-20 shrink-0`}
            value={unit}
            onChange={(event) =>
              onUnitChange(event.target.value as "GB" | "TB")
            }
          >
            <option value="GB">GB</option>
            <option value="TB">TB</option>
          </select>
        )}
      </div>
      {!valid && (
        <p id={`${id}-error`} className="text-destructive mt-2 text-xs">
          Enter {integer ? "a whole number" : "a number"} from {min} to {max}.
          Results use the last valid value.
        </p>
      )}
    </div>
  );
}

function OfferDetails({ result }: { result: CalculationResult }) {
  const { offer } = result;
  return (
    <div className="bg-secondary/40 grid gap-6 rounded-xl p-5 text-sm md:grid-cols-2">
      <div>
        <h3 className="mb-3 font-semibold">
          {result.total === null
            ? "Why there is no estimate"
            : "Where the cost comes from"}
        </h3>
        {result.reason ? (
          <p className="text-muted-foreground leading-relaxed">
            {result.reason}
          </p>
        ) : (
          <dl className="space-y-2">
            {(Object.keys(costLabels) as (keyof CostBreakdown)[]).map((key) => (
              <div key={key} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{costLabels[key]}</dt>
                <dd className="shrink-0 tabular-nums">
                  {money(result.costs[key])}
                </dd>
              </div>
            ))}
            <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
              <dt>Total, including commitments</dt>
              <dd className="tabular-nums">{money(result.total ?? 0)}</dd>
            </div>
          </dl>
        )}
        <p className="text-muted-foreground mt-4 text-xs">
          Estimated initial objects: {result.objects.toLocaleString("en-US")}.
        </p>
      </div>
      <div>
        <h3 className="mb-3 font-semibold">Region & pricing assumptions</h3>
        <p className="text-muted-foreground mb-3">{offer.region}</p>
        <ul className="text-muted-foreground list-disc space-y-2 pl-4 leading-relaxed">
          {result.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        {offer.pricing && (
          <p className="text-muted-foreground mt-3 text-xs">
            Billing unit:{" "}
            {offer.pricing.unit === "GiB"
              ? "GiB (1,073,741,824 bytes)"
              : "GB (1,000,000,000 bytes)"}
            .{" "}
            {offer.currency === "EUR" && (
              <>
                Converted at €1 = ${offer.exchangeRate} (
                <a
                  className="underline"
                  href={offer.exchangeSource}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ECB, {offer.exchangeDate}
                </a>
                ).
              </>
            )}
          </p>
        )}
        <p className="text-muted-foreground mt-4 text-xs">
          Sources reviewed {offer.reviewedAt}. Check the provider before
          purchasing.
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {offer.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              {source.label} ↗
            </a>
          ))}
          {offer.s3Evidence && (
            <a
              href={offer.s3Evidence}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              S3 documentation ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StorageCalculator({
  page,
  offers,
}: {
  page: CalculatorPage;
  offers: StorageOffer[];
}) {
  const [state, setState] = useState(() => defaultState(page));
  const [ready, setReady] = useState(false);
  const changeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advancedId = useId();

  useEffect(() => {
    const restore = () =>
      setState(
        readState(
          new URLSearchParams(window.location.search),
          page,
          offers.map((offer) => offer.id),
        ),
      );
    restore();
    setReady(true);
    try {
      sessionStorage.setItem("blinkdisk.storage-calculator", page);
    } catch {}
    window.addEventListener("popstate", restore);
    return () => {
      window.removeEventListener("popstate", restore);
      if (changeTimer.current) clearTimeout(changeTimer.current);
    };
  }, [page, offers]);

  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    url.search = writeState(url.searchParams, state, page).toString();
    window.history.replaceState(window.history.state, "", url);
  }, [state, page, ready]);

  function update(patch: Partial<CalculatorState>) {
    setState((previous) => ({ ...previous, ...patch }));
    if (changeTimer.current) clearTimeout(changeTimer.current);
    changeTimer.current = setTimeout(() => {
      window.posthog?.capture("storage_calculator_changed", {
        calculator: page,
        fields: Object.keys(patch),
        billing: patch.billing ?? state.billing,
      });
    }, 700);
  }

  const results = calculateOffers(offers, state);
  const available = results.filter((result) => result.total !== null).length;
  const objectField = (
    <NumberField
      label="Average object size (MB)"
      min={0.001}
      max={5_000_000}
      value={state.objectSize}
      onChange={(objectSize) => update({ objectSize })}
    />
  );

  return (
    <div id="storage-calculator" className="space-y-10">
      <section
        aria-labelledby="scenario-heading"
        className="bg-card rounded-2xl border p-5 sm:p-7"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 id="scenario-heading" className="text-lg font-semibold">
            Your storage scenario
          </h2>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
            onClick={() => {
              update(defaultState(page));
            }}
          >
            <RotateCcwIcon className="size-3.5" />
            Reset
          </button>
        </div>
        <div
          className={`grid gap-5 sm:grid-cols-2 ${page === "s3" ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
        >
          <NumberField
            label="Data stored"
            min={0.001}
            max={MAX_STORAGE}
            value={state.storage}
            unit={state.storageUnit}
            onChange={(storage) => update({ storage })}
            onUnitChange={(storageUnit) => update({ storageUnit })}
          />
          <NumberField
            label="Storage duration (months)"
            min={1}
            max={MAX_MONTHS}
            integer
            value={state.months}
            onChange={(months) => update({ months })}
          />
          <NumberField
            label="Downloads per month"
            min={0}
            max={MAX_STORAGE}
            value={state.downloads}
            unit={state.downloadUnit}
            onChange={(downloads) => update({ downloads })}
            onUnitChange={(downloadUnit) => update({ downloadUnit })}
          />
          {page === "s3" && objectField}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-5 border-t pt-5">
          <fieldset className="flex flex-wrap items-center gap-3">
            <legend className="sr-only">Billing preference</legend>
            <span className="text-muted-foreground text-sm" aria-hidden="true">
              Billing
            </span>
            <div className="bg-secondary inline-flex gap-1 rounded-xl p-1">
              {(["monthly", "yearly"] as const).map((billing) => (
                <label
                  key={billing}
                  className={`relative cursor-pointer rounded-lg px-4 py-2 text-sm font-medium has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${state.billing === billing ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                >
                  <input
                    type="radio"
                    name={`billing-${page}`}
                    value={billing}
                    checked={state.billing === billing}
                    onChange={() => update({ billing })}
                    className="sr-only"
                  />
                  {billing === "monthly" ? "Monthly" : "Yearly"}
                </label>
              ))}
            </div>
          </fieldset>
          {page === "backup" && (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
              aria-expanded={state.advanced}
              aria-controls={advancedId}
              onClick={() => update({ advanced: !state.advanced })}
            >
              Advanced
              <ChevronDownIcon
                className={`size-4 transition-transform ${state.advanced ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
        {page === "backup" && (
          <div
            id={advancedId}
            hidden={!state.advanced}
            className="mt-5 max-w-sm"
          >
            {objectField}
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              The average stored object size estimates request counts, rather
              than the size of each original file.
            </p>
          </div>
        )}
        <p className="text-muted-foreground mt-5 text-xs leading-relaxed">
          One initial upload, a constant stored volume and the same downloads
          each month. 1 TB = 1,000 GB. No ongoing changes, growth, compression
          or backup versioning are simulated. Request counts exclude listing,
          metadata checks, retries and multipart-upload overhead.
        </p>
        {state.billing === "yearly" && (
          <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
            Published annual packages are charged in whole years, including
            unused committed months. Other offers keep their monthly usage
            rates.
          </p>
        )}
        <noscript>
          <p className="mt-3 text-sm">
            These are the default 1 TB, 12-month estimates. Enable JavaScript to
            change the scenario.
          </p>
        </noscript>
      </section>

      <section aria-labelledby="results-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="results-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              Compare the real cost
            </h2>
            <p className="text-muted-foreground mt-2 text-sm" role="status">
              {available} estimates · {offers.length - available} not estimated
              · USD, before tax
            </p>
          </div>
          <label className="text-muted-foreground flex items-center gap-2 text-sm">
            Sort by
            <select
              className="bg-background focus-visible:outline-primary rounded-lg border px-3 py-2 text-sm text-foreground"
              value={state.sort}
              onChange={(event) =>
                update({ sort: event.target.value as CalculatorState["sort"] })
              }
            >
              <option value="cost">Total cost</option>
              <option value="provider">Provider</option>
            </select>
          </label>
        </div>
        <div className="bg-card overflow-hidden rounded-2xl border">
          <table className="w-full table-fixed text-left text-sm">
            <caption className="sr-only">
              {page === "backup"
                ? "Backup cloud storage"
                : "S3-compatible storage"}{" "}
              estimated costs over {state.months} months
            </caption>
            <thead className="bg-secondary/60 text-muted-foreground border-b text-xs">
              <tr>
                <th
                  scope="col"
                  className="w-[43%] px-4 py-4 font-medium sm:w-auto sm:px-6"
                >
                  Provider / product
                </th>
                <th
                  scope="col"
                  className="px-2 py-4 text-right font-medium sm:px-4"
                >
                  <span className="hidden sm:inline">
                    Total for {state.months} mo.
                  </span>
                  <span className="sm:hidden">
                    Total
                    <span className="mt-1 block text-[10px]">
                      {state.months} months
                    </span>
                  </span>
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-4 text-right font-medium md:table-cell"
                >
                  Effective / month
                </th>
                <th scope="col" className="w-20 px-2 py-4 sm:w-28 sm:px-6">
                  <span className="sr-only">Cost details</span>
                </th>
              </tr>
            </thead>
            {results.map((result) => {
              const expanded = state.details.includes(result.offer.id);
              const detailsId = `offer-${page}-${result.offer.id}`;
              return (
                <tbody
                  key={result.offer.id}
                  className="border-b last:border-b-0"
                >
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <th
                      scope="row"
                      className="break-words px-4 py-5 font-normal sm:px-6"
                    >
                      <span className="block font-semibold">
                        {result.offer.provider}
                      </span>
                      <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                        {result.offer.product}
                      </span>
                    </th>
                    <td className="px-2 py-5 text-right sm:px-4">
                      {result.total === null ? (
                        <span className="text-muted-foreground text-xs">
                          Not estimated
                        </span>
                      ) : (
                        <>
                          <span className="block font-semibold tabular-nums">
                            {money(result.total)}
                          </span>
                          <span className="text-muted-foreground mt-1 block text-xs tabular-nums md:hidden">
                            {money(result.monthly ?? 0)}/mo.
                          </span>
                        </>
                      )}
                    </td>
                    <td className="hidden px-4 py-5 text-right tabular-nums md:table-cell">
                      {result.monthly === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        money(result.monthly)
                      )}
                    </td>
                    <td className="px-2 py-5 text-right sm:px-6">
                      <button
                        type="button"
                        aria-label={`Cost details for ${result.offer.provider} ${result.offer.product}`}
                        aria-expanded={expanded}
                        aria-controls={detailsId}
                        className="text-muted-foreground hover:text-foreground inline-flex min-h-10 items-center gap-1 text-xs"
                        onClick={() =>
                          update({
                            details: expanded
                              ? state.details.filter(
                                  (id) => id !== result.offer.id,
                                )
                              : [...state.details, result.offer.id],
                          })
                        }
                      >
                        Details
                        <ChevronDownIcon
                          className={`size-3 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </td>
                  </tr>
                  <tr hidden={!expanded} id={detailsId}>
                    <td colSpan={4} className="px-3 pb-4 sm:px-5">
                      <OfferDetails result={result} />
                    </td>
                  </tr>
                </tbody>
              );
            })}
          </table>
        </div>
        <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
          Totals include modeled mandatory commitments and assume published
          recurring free allowances are unused. Offers without verified complete
          pricing or outside their standard limits appear after valid estimates.
          These are planning estimates, not provider quotes.
        </p>
      </section>
    </div>
  );
}
