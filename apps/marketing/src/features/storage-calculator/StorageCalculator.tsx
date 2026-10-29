import { cn } from "@blinkdisk/utils/class";
import { CloudBlinkIcon } from "@marketing/components/icons/providers/cloudblink";
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
  StorageUnit,
} from "@marketing/features/storage-calculator/types";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BoxIcon,
  CalendarIcon,
  ChevronDownIcon,
  DatabaseIcon,
  DownloadIcon,
  InfoIcon,
  type LucideIcon,
  MapPinIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

const money = (amount: number) =>
  amount > 0 && amount < 0.01
    ? "<$0.01"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
const costLabels: Record<keyof CostBreakdown, string> = {
  storage: "Storage",
  upload: "Upload transfer",
  download: "Downloads (egress)",
  retrieval: "Retrieval fees",
  requests: "API requests",
  minimum: "Top-up to minimum bill",
  commitment: "Committed but unused storage",
};
const alwaysShownCosts: (keyof CostBreakdown)[] = ["storage", "download"];
const HIGHLIGHTED_OFFER = "cloudblink";
const eyebrowClass =
  "text-muted-foreground text-xs font-medium uppercase tracking-wider";
const ghostButtonClass =
  "text-muted-foreground hover:text-foreground hover:bg-secondary focus-visible:outline-primary inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors";

function Segmented<T extends string>({
  legend,
  value,
  options,
  onChange,
  size = "default",
}: {
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  size?: "default" | "sm";
}) {
  const name = useId();
  return (
    <fieldset
      className={cn(
        "border-input/50 bg-card dark:border-input/25 inline-flex shrink-0 rounded-lg border p-[3px]",
        size === "default" ? "h-10" : "h-8",
      )}
    >
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "has-focus-visible:outline-primary relative flex cursor-pointer items-center rounded-md font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-1",
            size === "default" ? "px-4 text-sm" : "px-2.5 text-xs",
            value === option.value
              ? "bg-secondary text-foreground shadow-sm"
              : "text-foreground/60 hover:text-foreground",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

function NumberField({
  label,
  icon: Icon,
  value,
  min,
  max,
  integer = false,
  onChange,
  suffix,
  unit,
  onUnitChange,
}: {
  label: string;
  icon: LucideIcon;
  value: number;
  min: number;
  max: number;
  integer?: boolean;
  onChange: (value: number) => void;
  suffix?: string;
  unit?: StorageUnit;
  onUnitChange?: (value: StorageUnit) => void;
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
  const describedBy = [suffix && `${id}-suffix`, !valid && `${id}-error`]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="bg-card focus-within:bg-secondary/40 flex min-w-0 flex-col gap-3 p-5 transition-colors sm:p-6">
      <label
        htmlFor={id}
        className={cn(eyebrowClass, "flex items-center gap-2")}
      >
        <Icon className="size-3.5 shrink-0" />
        {label}
      </label>
      <div className="flex items-center gap-3">
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
          aria-describedby={describedBy || undefined}
          className="aria-invalid:text-destructive w-full min-w-0 [appearance:textfield] bg-transparent text-3xl font-semibold tracking-tight tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
          <Segmented
            legend={`${label} unit`}
            size="sm"
            value={unit}
            options={[
              { value: "GB", label: "GB" },
              { value: "TB", label: "TB" },
            ]}
            onChange={onUnitChange}
          />
        )}
        {suffix && (
          <span
            id={`${id}-suffix`}
            className="text-muted-foreground shrink-0 text-sm"
          >
            {suffix}
          </span>
        )}
      </div>
      {!valid && (
        <p id={`${id}-error`} className="text-destructive text-xs">
          Enter {integer ? "a whole number" : "a number"} between {min} and{" "}
          {max}. Until then, results use your last valid entry.
        </p>
      )}
    </div>
  );
}

function OfferName({ offer }: { offer: StorageOffer }) {
  if (offer.id === HIGHLIGHTED_OFFER)
    return (
      <>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-primary inline-flex items-center gap-1.5 font-semibold">
            <CloudBlinkIcon className="size-5 shrink-0" />
            {offer.product}
          </span>
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-medium">
            Our storage
          </span>
        </span>
        <span className="text-muted-foreground mt-1 block text-xs">
          Managed storage by {offer.provider}
        </span>
      </>
    );
  return (
    <>
      <span className="block font-semibold">{offer.provider}</span>
      <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
        {offer.product}
      </span>
    </>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-card hover:border-foreground/20 inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
    >
      {children}
      <ArrowUpRightIcon className="text-muted-foreground size-3" />
    </a>
  );
}

function OfferDetails({
  result,
  page,
}: {
  result: CalculationResult;
  page: CalculatorPage;
}) {
  const { offer } = result;
  const shownCosts = (
    Object.keys(costLabels) as (keyof CostBreakdown)[]
  ).filter((key) => alwaysShownCosts.includes(key) || result.costs[key] > 0);
  return (
    <div className="bg-secondary/50 grid overflow-hidden rounded-xl border text-sm md:grid-cols-2">
      <div className="p-5 sm:p-6">
        <h3 className={cn(eyebrowClass, "mb-4")}>
          {result.total === null
            ? "Why there’s no estimate"
            : "Where the cost comes from"}
        </h3>
        {result.reason ? (
          <p className="text-muted-foreground leading-relaxed">
            {result.reason}
          </p>
        ) : (
          <dl className="space-y-3">
            {shownCosts.map((key) => (
              <div
                key={key}
                className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5"
              >
                <dt className="text-muted-foreground">{costLabels[key]}</dt>
                <dd className="tabular-nums">{money(result.costs[key])}</dd>
                <dd
                  aria-hidden="true"
                  className="bg-foreground/10 col-span-2 h-1 overflow-hidden rounded-full"
                >
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{
                      width: `${result.total ? (result.costs[key] / result.total) * 100 : 0}%`,
                    }}
                  />
                </dd>
              </div>
            ))}
            <div className="flex justify-between border-t pt-3 font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{money(result.total ?? 0)}</dd>
            </div>
          </dl>
        )}
        <p className="text-muted-foreground mt-4 text-xs">
          About {result.objects.toLocaleString("en-US")} objects uploaded.
        </p>
        {offer.id === HIGHLIGHTED_OFFER && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <a
              href={`/download?calculator=${page}`}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors"
              onClick={(event) => trackCta(page, event.currentTarget)}
            >
              Try CloudBlink for free
              <ArrowRightIcon className="size-4" />
            </a>
            <a
              href="/cloudblink"
              className={ghostButtonClass}
              onClick={(event) => trackCta(page, event.currentTarget)}
            >
              About CloudBlink
            </a>
          </div>
        )}
      </div>
      <div className="border-t p-5 sm:p-6 md:border-l md:border-t-0">
        <h3 className={cn(eyebrowClass, "mb-4")}>Region and assumptions</h3>
        <p className="mb-3 flex items-start gap-2">
          <MapPinIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          {offer.region}
        </p>
        <ul className="text-muted-foreground list-disc space-y-2 pl-4 leading-relaxed">
          {result.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        {offer.pricing && (
          <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
            Billing unit:{" "}
            {offer.pricing.unit === "GiB"
              ? "GiB (1,073,741,824 bytes)"
              : "GB (1,000,000,000 bytes)"}
            .{" "}
            {offer.currency === "EUR" && (
              <>
                Converted at €1 = ${offer.exchangeRate} (
                <a
                  className="underline underline-offset-2"
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
        <div className="mt-5 border-t pt-4">
          <p className="text-muted-foreground mb-3 text-xs">
            Sources reviewed {offer.reviewedAt}. Prices change, so check with
            the provider before you buy.
          </p>
          <div className="flex flex-wrap gap-2">
            {offer.sources.map((source) => (
              <ExternalLink key={source.url} href={source.url}>
                {source.label}
              </ExternalLink>
            ))}
            {offer.s3Evidence && (
              <ExternalLink href={offer.s3Evidence}>
                S3 documentation
              </ExternalLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function trackCta(page: CalculatorPage, link: HTMLAnchorElement) {
  try {
    sessionStorage.setItem("blinkdisk.storage-calculator", page);
  } catch {}
  window.posthog?.capture("storage_calculator_cta_clicked", {
    calculator: page,
    destination: link.getAttribute("href"),
  });
}

function compareToLowest(total: number, lowest: number) {
  if (lowest <= 0) return `+${money(total - lowest)}`;
  const ratio = total / lowest;
  return `${ratio.toFixed(ratio < 10 ? 1 : 0)}×`;
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
  const costOrder = results
    .flatMap((result) =>
      result.total === null
        ? []
        : [{ id: result.offer.id, total: result.total }],
    )
    .sort((a, b) => a.total - b.total);
  const ranks = new Map(costOrder.map((entry, index) => [entry.id, index + 1]));
  const lowest = costOrder[0]?.total ?? 0;
  const available = costOrder.length;
  const objectField = (
    <NumberField
      label="Average object size"
      icon={BoxIcon}
      suffix="MB"
      min={0.001}
      max={5_000_000}
      value={state.objectSize}
      onChange={(objectSize) => update({ objectSize })}
    />
  );

  return (
    <div id="storage-calculator" className="space-y-12 sm:space-y-16">
      <section
        aria-labelledby="scenario-heading"
        className="bg-card overflow-hidden rounded-2xl border"
      >
        <h2 id="scenario-heading" className="sr-only">
          Your storage scenario
        </h2>
        <div
          className={cn(
            "bg-border grid gap-px",
            page === "s3" ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3",
          )}
        >
          <NumberField
            label="Data stored"
            icon={DatabaseIcon}
            min={0.001}
            max={MAX_STORAGE}
            value={state.storage}
            unit={state.storageUnit}
            onChange={(storage) => update({ storage })}
            onUnitChange={(storageUnit) => update({ storageUnit })}
          />
          <NumberField
            label="Storage duration"
            icon={CalendarIcon}
            suffix="months"
            min={1}
            max={MAX_MONTHS}
            integer
            value={state.months}
            onChange={(months) => update({ months })}
          />
          <NumberField
            label="Downloads per month"
            icon={DownloadIcon}
            min={0}
            max={MAX_STORAGE}
            value={state.downloads}
            unit={state.downloadUnit}
            onChange={(downloads) => update({ downloads })}
            onUnitChange={(downloadUnit) => update({ downloadUnit })}
          />
          {page === "s3" && objectField}
        </div>
        {page === "backup" && (
          <div
            id={advancedId}
            hidden={!state.advanced}
            className="bg-border border-t"
          >
            <div className="bg-border grid gap-px md:grid-cols-3">
              {objectField}
              <p className="bg-card text-muted-foreground flex items-center p-5 text-sm leading-relaxed sm:p-6 md:col-span-2">
                The average size of the objects your backup app uploads. It’s
                used to estimate request fees and isn’t the size of your
                original files.
              </p>
            </div>
          </div>
        )}
        <div className="bg-secondary/40 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm" aria-hidden="true">
              Billing
            </span>
            <Segmented
              legend="Billing preference"
              value={state.billing}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
              onChange={(billing) => update({ billing })}
            />
          </div>
          <div className="flex items-center gap-1">
            {page === "backup" && (
              <button
                type="button"
                className={ghostButtonClass}
                aria-expanded={state.advanced}
                aria-controls={advancedId}
                onClick={() => update({ advanced: !state.advanced })}
              >
                <SlidersHorizontalIcon className="size-3.5" />
                Advanced
              </button>
            )}
            <button
              type="button"
              className={ghostButtonClass}
              onClick={() => update(defaultState(page))}
            >
              <RotateCcwIcon className="size-3.5" />
              Reset
            </button>
          </div>
        </div>
        <noscript>
          <p className="border-t px-5 py-3 text-sm">
            These are the default estimates: 3 TB stored for 12 months, 2 TB
            downloaded per month and yearly billing. Turn on JavaScript to enter
            your own numbers.
          </p>
        </noscript>
      </section>

      <section aria-labelledby="results-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="results-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Total cost by provider
            </h2>
            <p className="text-muted-foreground mt-2 text-sm" role="status">
              {available} estimates
              {available < offers.length &&
                ` · ${offers.length - available} outside this scenario`}
              {" · USD, before tax"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm" aria-hidden="true">
              Sort by
            </span>
            <Segmented
              legend="Sort by"
              value={state.sort}
              options={[
                { value: "cost", label: "Total cost" },
                { value: "provider", label: "Provider" },
              ]}
              onChange={(sort) => update({ sort })}
            />
          </div>
        </div>
        <div className="bg-card overflow-hidden rounded-2xl border">
          <table className="w-full table-fixed text-left text-sm">
            <caption className="sr-only">
              {page === "backup"
                ? "Backup cloud storage"
                : "S3-compatible storage"}{" "}
              estimated costs over {state.months} months
            </caption>
            <thead className={cn(eyebrowClass, "border-b text-[11px]")}>
              <tr>
                <th
                  scope="col"
                  className="hidden w-14 py-3.5 pl-6 font-medium sm:table-cell"
                >
                  #
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium sm:pl-2">
                  Provider
                </th>
                <th
                  scope="col"
                  className="hidden w-32 px-4 py-3.5 text-right font-medium md:table-cell"
                >
                  vs. lowest
                </th>
                <th
                  scope="col"
                  className="hidden w-32 px-4 py-3.5 text-right font-medium md:table-cell"
                >
                  Per month
                </th>
                <th
                  scope="col"
                  className="w-32 px-2 py-3.5 text-right font-medium sm:w-40 sm:px-4"
                >
                  <span className="hidden sm:inline">
                    Total for {state.months} mo.
                  </span>
                  <span className="sm:hidden">{state.months} mo. total</span>
                </th>
                <th scope="col" className="w-14 py-3.5 pr-3 sm:w-16 sm:pr-4">
                  <span className="sr-only">Cost details</span>
                </th>
              </tr>
            </thead>
            {results.map((result) => {
              const { offer } = result;
              const expanded = state.details.includes(offer.id);
              const detailsId = `offer-${page}-${offer.id}`;
              const rank = ranks.get(offer.id);
              const highlighted = offer.id === HIGHLIGHTED_OFFER;
              const toggle = () =>
                update({
                  details: expanded
                    ? state.details.filter((id) => id !== offer.id)
                    : [...state.details, offer.id],
                });
              return (
                <tbody
                  key={offer.id}
                  className={cn(
                    "border-b last:border-b-0",
                    highlighted && "bg-primary/[0.04] dark:bg-primary/[0.08]",
                  )}
                >
                  <tr
                    className={cn(
                      "transition-colors",
                      !highlighted && "hover:bg-secondary/40",
                    )}
                  >
                    <td
                      className={cn(
                        "text-muted-foreground hidden py-4 pl-6 align-middle text-xs tabular-nums sm:table-cell",
                        highlighted && "shadow-[inset_3px_0_0_var(--primary)]",
                      )}
                    >
                      {rank ?? "–"}
                    </td>
                    <th
                      scope="row"
                      className="break-words px-4 py-4 font-normal sm:pl-2"
                    >
                      <OfferName offer={offer} />
                    </th>
                    <td className="hidden px-4 py-4 text-right md:table-cell">
                      {result.total === null ? (
                        <span className="text-muted-foreground">–</span>
                      ) : rank === 1 ? (
                        <span className="bg-foreground text-background rounded-full px-2 py-0.5 text-[11px] font-medium">
                          Lowest
                        </span>
                      ) : (
                        <span className="text-muted-foreground tabular-nums">
                          {compareToLowest(result.total, lowest)}
                        </span>
                      )}
                    </td>
                    <td className="text-muted-foreground hidden px-4 py-4 text-right tabular-nums md:table-cell">
                      {result.monthly === null ? "–" : money(result.monthly)}
                    </td>
                    <td className="px-2 py-4 text-right sm:px-4">
                      {result.total === null ? (
                        <span className="text-muted-foreground text-xs">
                          Outside limits
                        </span>
                      ) : (
                        <>
                          <span className="block text-base font-semibold tabular-nums">
                            {money(result.total)}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block text-xs tabular-nums md:hidden">
                            {money(result.monthly ?? 0)}/mo.
                          </span>
                        </>
                      )}
                    </td>
                    <td className="py-4 pr-3 text-right sm:pr-4">
                      <button
                        type="button"
                        aria-label={`Cost details for ${offer.provider} ${offer.product}`}
                        aria-expanded={expanded}
                        aria-controls={detailsId}
                        className={cn(
                          "text-muted-foreground hover:text-foreground hover:bg-secondary focus-visible:outline-primary inline-flex size-9 items-center justify-center rounded-md transition-colors",
                          expanded && "bg-secondary text-foreground",
                        )}
                        onClick={toggle}
                      >
                        <ChevronDownIcon
                          className={cn(
                            "size-4 transition-transform",
                            expanded && "rotate-180",
                          )}
                        />
                      </button>
                    </td>
                  </tr>
                  <tr hidden={!expanded} id={detailsId}>
                    <td colSpan={6} className="px-3 pb-4 sm:px-5 sm:pb-5">
                      <OfferDetails result={result} page={page} />
                    </td>
                  </tr>
                </tbody>
              );
            })}
          </table>
        </div>
        <div className="text-muted-foreground mt-5 flex gap-3 text-xs leading-relaxed">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-2">
            <p>
              The estimate assumes you upload everything once, the amount stored
              stays the same, and you download the same amount every month. 1 TB
              is 1,000 GB. Changes, growth, compression and backup versions
              aren’t simulated. Request counts leave out listing, metadata
              checks, retries and multipart overhead.
            </p>
            {state.billing === "yearly" && (
              <p>
                Annual plans are charged in whole years, even for months you
                don’t use. Providers without an annual plan are billed monthly.
              </p>
            )}
            <p>
              Totals include required commitments and assume free allowances
              aren’t already used by something else on your account. Offers that
              can’t handle your numbers are listed last; open them to see why.
              These are estimates to help you plan, not quotes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
