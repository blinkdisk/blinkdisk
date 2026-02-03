import type { BillingPeriod } from "@config/plans";
import { plans } from "@config/plans";
import { FREE_SPACE_AVAILABLE } from "@config/space";
import { usePlanPrices } from "@hooks/use-plan-prices";
import { ArrowLeftIcon, CheckIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";

const features = [
  {
    title: "Unlimited Storages",
    description:
      "Create as many backup locations as you like. No limits, no extra cost.",
  },
  {
    title: "Unlimited Devices",
    description: "Back up every device you own under a single account.",
  },
  {
    title: "Unlimited Backups",
    description:
      "Run automatic or manual backups as often as you want without restrictions.",
  },
  {
    title: "End-to-End Encryption",
    description:
      "Your data is encrypted before it leaves your device, ensuring only you can access it.",
  },
  {
    title: "Built-in Compression",
    description:
      "Save storage space with built-in intelligent file compression.",
    hideOnMobile: true,
  },
  {
    title: "Retention Settings",
    description:
      "Control how long old backups are kept and automatically prune old ones.",
  },
  {
    title: "File Deduplication",
    description:
      "Identical files are stored only once, saving space across all backups and devices.",
  },
  {
    title: "Scheduled Backups",
    description:
      "Set BlinkDisk to automatically back up your data on a schedule that fits your workflow.",
  },
  {
    title: "Custom Storage",
    description:
      "Use your own cloud provider or self-hosted storage for full control and zero costs.",
  },
];

const storageOptions = [
  {
    name: "Local Drives",
    description: "Store backups on your computer",
    icon: "filesystem",
  },
  {
    name: "Network Attached Storage",
    description: "Use your home or office NAS",
    icon: "nas",
  },
  {
    name: "S3 Compatible",
    description: "Any S3-compatible service",
    icon: "s3",
  },
  {
    name: "SFTP",
    description: "Backup to secure SFTP server",
    icon: "sftp",
  },
  {
    name: "WebDAV",
    description: "Use any WebDAV server",
    icon: "webdav",
  },
  {
    name: "AWS S3",
    description: "Reliable storage by AWS",
    image: "aws.svg",
  },
  {
    name: "Google Cloud Storage",
    description: "Google Cloud's storage solution",
    image: "google-cloud-storage.svg",
  },
  {
    name: "Azure Blob Storage",
    description: "Azure's cloud storage option",
    image: "azure-blob-storage.svg",
  },
];

const currency = "USD";

export default function PricingClient() {
  const [groupIndex, setGroupIndex] = useState(0);
  const [period, setPeriod] = useState<BillingPeriod>("YEARLY");

  const groupPlans = useMemo(() => plans.filter((plan) => plan.group), []);
  const groupPlan = useMemo(
    () => groupPlans[groupIndex],
    [groupPlans, groupIndex],
  );

  return (
    <div className="py-page flex min-h-screen flex-col items-center">
      <div className="mt-auto"></div>
      <h1 className="text-primary text-lg font-medium">Plans & Pricing</h1>
      <p className="mt-2 max-w-[90vw] text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Get all features for free…
      </p>
      <p className="text-muted-foreground mt-4 max-w-[90vw] text-center text-sm sm:max-w-md">
        All BlinkDisk features are completely free, you only pay for the storage
        you use. Here's a quick look at what's included.
      </p>
      <div className="mt-12 grid max-w-[90vw] grid-cols-2 gap-4 md:max-w-5xl md:grid-cols-3 md:gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={`flex flex-col gap-3 md:flex-row ${
              feature.hideOnMobile ? "hidden md:flex" : ""
            }`}
          >
            <CheckIcon className="text-primary mt-1 size-5 min-w-5" />
            <div className="flex flex-col">
              <p className="md:text-lg">{feature.title}</p>
              <p className="text-muted-foreground mt-1 text-xs md:mt-0">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <h2 className="mt-30 max-w-[90vw] text-center text-3xl font-bold tracking-tight sm:text-4xl">
        …and backup anywhere.
      </h2>
      <p className="text-muted-foreground mt-4 max-w-[90vw] text-center text-sm sm:max-w-md">
        We let you choose between BlinkDisk Cloud (our managed cloud backup
        service) or a variety of custom storage providers.
      </p>
      <div className="w-content mt-12 flex flex-col items-start gap-20 lg:flex-row">
        <div className="w-full lg:w-2/3">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <div className="flex items-center gap-3">
              <Logo className="h-6 select-none" />
              <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-sm">
                Cloud
              </span>
            </div>
            <div className="bg-secondary mt-6 flex rounded-lg p-1 sm:mt-0">
              <button
                onClick={() => setPeriod("MONTHLY")}
                className={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
                  period === "MONTHLY"
                    ? "bg-background shadow"
                    : "hover:bg-background/50"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPeriod("YEARLY")}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  period === "YEARLY"
                    ? "bg-background shadow"
                    : "hover:bg-background/50"
                }`}
              >
                Yearly
                <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs">
                  Save ~25%
                </span>
              </button>
            </div>
          </div>
          <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
            <Plan
              plan={{
                id: "free",
                storageGB: FREE_SPACE_AVAILABLE / 1000 / 1000 / 1000,
                prices: [],
                free: true,
              }}
              period={period}
              currency={currency}
            />
            {plans
              .filter((plan) => !plan.group)
              .map((plan) => (
                <Plan
                  key={plan.id}
                  plan={plan}
                  period={period}
                  currency={currency}
                />
              ))}
            {groupPlan && (
              <Plan
                plan={groupPlan}
                period={period}
                currency={currency}
                groupIndex={groupIndex}
                setGroupIndex={setGroupIndex}
                maxGroupIndex={groupPlans.length - 1}
              />
            )}
          </div>
        </div>
        <div className="relative flex w-full flex-col items-center lg:w-1/3 lg:items-start">
          <div className="border-foreground/20 absolute left-0 top-20 hidden h-[calc(100%-5rem)] -translate-x-10 border-l-2 border-dashed lg:block"></div>
          <h3 className="text-center text-3xl font-bold sm:text-left">
            Custom Storage
          </h3>
          <div className="mt-10 flex flex-col gap-3">
            {storageOptions.map((storageOption) => (
              <div
                key={storageOption.name}
                className="flex items-center justify-start gap-3"
              >
                {storageOption.icon ? (
                  <StorageIcon icon={storageOption.icon} />
                ) : (
                  <img
                    src={`/images/providers/${storageOption.image}`}
                    className="size-7 grayscale"
                    alt={storageOption.name}
                  />
                )}
                <div className="flex flex-col">
                  <p className="text-sm">{storageOption.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {storageOption.description}
                  </p>
                </div>
              </div>
            ))}
            <p className="text-muted-foreground mt-2 text-center">
              …and a lot more.
            </p>
          </div>
        </div>
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}

function StorageIcon({ icon }: { icon: string }) {
  const className = "mx-1 size-5 text-muted-foreground";

  switch (icon) {
    case "filesystem":
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
          <path d="M43.9083 31.975C42.6917 32.5125 41.7458 33.1875 40.9333 33.9625L38.2417 33.2917C39.3208 32.0708 40.7125 30.9917 42.4708 30.1833C44.2708 29.375 46.1625 28.9667 48.1 28.8L47.6917 30.925C46.3875 31.0958 45.125 31.4292 43.9083 31.975ZM49.9833 33.825C54.2542 33.825 57.6792 36.3917 57.6792 39.5667C57.6792 42.775 54.2583 45.3375 49.9833 45.3375C45.7542 45.3375 42.2875 42.7708 42.2875 39.5667C42.2875 36.3917 45.7542 33.825 49.9833 33.825ZM46.5417 39.5708C46.5417 41.0292 48.0792 42.1792 49.9833 42.1792C51.9292 42.1792 53.4708 41.025 53.4708 39.5708C53.4708 38.1417 51.9292 36.9875 49.9833 36.9875C48.0792 36.9875 46.5417 38.1417 46.5417 39.5708ZM81.25 79.1667C82.4 79.1667 83.3333 78.2333 83.3333 77.0833C83.3333 75.9333 82.4 75 81.25 75C80.1 75 79.1667 75.9333 79.1667 77.0833C79.1667 78.2333 80.1 79.1667 81.25 79.1667ZM79.1667 8.33334H20.8333L0 66.6667V91.6667H100V66.6667L79.1667 8.33334ZM49.9833 20.8333C63.7958 20.8333 75.0083 29.2375 75.0083 39.5708C75.0083 49.9333 63.8 58.3333 49.9833 58.3333C36.1667 58.3333 25.0083 49.9292 25.0083 39.5708C25.0083 29.2375 36.1708 20.8333 49.9833 20.8333ZM91.6667 83.3333H37.5V77.0833C37.5 75.9333 36.5667 75 35.4167 75C34.2667 75 33.3333 75.9333 33.3333 77.0833V83.3333H29.1667V77.0833C29.1667 75.9333 28.2333 75 27.0833 75C25.9333 75 25 75.9333 25 77.0833V83.3333H20.8333V77.0833C20.8333 75.9333 19.9 75 18.75 75C17.6 75 16.6667 75.9333 16.6667 77.0833V83.3333H8.33333V70.8333H91.6667V83.3333Z" />
        </svg>
      );
    case "nas":
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
          <path d="M100 37.5H0V62.5H100V37.5ZM87.5 54.1667C85.2 54.1667 83.3333 52.3 83.3333 50C83.3333 47.7 85.2 45.8333 87.5 45.8333C89.8042 45.8333 91.6667 47.7 91.6667 50C91.6667 52.3 89.8042 54.1667 87.5 54.1667ZM100 70.8333H0V95.8333H100V70.8333ZM87.5 87.5C85.2 87.5 83.3333 85.6333 83.3333 83.3333C83.3333 81.0333 85.2 79.1667 87.5 79.1667C89.8042 79.1667 91.6667 81.0333 91.6667 83.3333C91.6667 85.6333 89.8042 87.5 87.5 87.5ZM91.6667 29.1667H8.33333L25 4.16666H75L91.6667 29.1667Z" />
        </svg>
      );
    case "s3":
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
          <path d="M45.8333 4.16669C66.5458 4.16669 87.5 9.76252 87.5 16.6667V29.4709C91.9875 33.7834 95.8333 39.1834 95.8333 45.3834C95.8333 54.4084 87.7875 59.4584 78.5167 59.4584C70.5083 59.4584 60.6125 55.9208 50.5875 47.7667C51.5083 46.675 52.0833 45.2875 52.0833 43.75C52.0833 40.2959 49.2875 37.5 45.8333 37.5C42.3792 37.5 39.5833 40.2959 39.5833 43.75C39.5833 47.2042 42.3792 50 45.8333 50L46.6708 49.9167C57.0708 58.7709 68.2333 63.6209 78.5208 63.625C81.775 63.625 84.7792 63.075 87.5042 62.1042V80.2208C87.5 88.5292 70.8333 95.8334 45.7125 95.8334C20.9625 95.8334 4.16668 88.5625 4.16668 80.2208V16.6667C4.16668 9.76252 25.1208 4.16669 45.8333 4.16669Z" />
        </svg>
      );
    case "sftp":
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
          <path d="M29.167 8.33301C36.2294 16.4245 39.0457 20.8329 45.833 20.833H100V91.667H0V8.33301H29.167Z" />
        </svg>
      );
    case "webdav":
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
          <path d="M50 12.5C66.6916 12.5 80.2787 25.5874 81.1621 42.0498C91.8703 43.979 99.9998 53.3248 100 64.583C100 77.2372 89.7372 87.5 77.083 87.5H22.917C10.2628 87.5 0 77.2372 0 64.583C0.000155747 53.3248 8.12966 43.979 18.8379 42.0498C19.7213 25.5874 33.3084 12.5 50 12.5Z" />
        </svg>
      );
    default:
      return null;
  }
}

type PlanProps = {
  plan: (typeof plans)[number] & { free?: boolean };
  period: BillingPeriod;
  currency: string;
  groupIndex?: number;
  setGroupIndex?: (index: number) => void;
  maxGroupIndex?: number;
};

function Plan({
  plan,
  period,
  currency,
  groupIndex,
  setGroupIndex,
  maxGroupIndex,
}: PlanProps) {
  const [contact, setContact] = useState(false);

  const { price, savings, monthlyAmount } = usePlanPrices(
    plan,
    period,
    currency,
  );

  if (!price && !plan.free) return null;
  return (
    <div className="bg-card text-card-foreground relative flex flex-col justify-between rounded-xl border p-6">
      <div className="flex flex-col">
        {!contact ? (
          <>
            <div className="flex items-center justify-center gap-2 xl:gap-3">
              {setGroupIndex ? (
                <button
                  onClick={() => setGroupIndex((groupIndex || 0) - 1)}
                  disabled={groupIndex === 0}
                  className="bg-secondary hover:bg-secondary/80 border-border flex size-6 items-center justify-center rounded-md border disabled:opacity-50"
                >
                  <MinusIcon className="size-4" />
                </button>
              ) : null}
              <p className="text-center text-3xl font-bold">
                {plan.storageGB.toLocaleString()} GB
              </p>
              {setGroupIndex ? (
                <button
                  onClick={() =>
                    groupIndex === maxGroupIndex
                      ? setContact(true)
                      : setGroupIndex((groupIndex || 0) + 1)
                  }
                  disabled={contact}
                  className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md disabled:opacity-50"
                >
                  <PlusIcon className="size-4" />
                </button>
              ) : null}
            </div>
            {!contact ? (
              <p className="text-muted-foreground mt-1 text-center text-xs">
                Enjoy {plan.storageGB.toLocaleString()} GB of cloud storage
              </p>
            ) : null}
          </>
        ) : (
          <button
            onClick={() => setContact(false)}
            className="bg-secondary hover:bg-secondary/80 border-border inline-flex h-8 items-center justify-center gap-2 rounded-md border px-3 text-sm"
          >
            <ArrowLeftIcon className="size-4" />
            Go Back
          </button>
        )}
      </div>
      {!contact ? (
        <div className="mt-3 flex h-20 flex-col items-start justify-center">
          {savings ? (
            <p className="text-muted-foreground text-sm line-through">
              {savings.original?.toLocaleString(undefined, {
                style: "currency",
                minimumFractionDigits: 0,
                currency,
              })}
              /month
            </p>
          ) : null}
          <p className="text-2xl font-semibold">
            <>
              {(monthlyAmount || 0).toLocaleString(undefined, {
                style: "currency",
                minimumFractionDigits: 0,
                currency,
              })}
              <span key={1} className="text-sm font-normal">
                /month
              </span>
            </>
          </p>
          {savings ? (
            <p className="text-primary text-sm">
              Save{" "}
              {savings.yearly?.toLocaleString(undefined, {
                style: "currency",
                minimumFractionDigits: 0,
                currency,
              })}{" "}
              yearly
            </p>
          ) : null}
        </div>
      ) : (
        <div className="my-4">
          <p className="text-lg font-semibold tracking-tight">
            Looking for more storage?
          </p>
          <p className="text-muted-foreground text-sm">
            Feel free to contact us at cloud@blinkdisk.com for a quote.
          </p>
        </div>
      )}
      {contact ? (
        <button
          onClick={() => window.open("mailto:cloud@blinkdisk.com")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors"
        >
          Contact Us
        </button>
      ) : null}
    </div>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 2794 415"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="153.987"
        y="47.9989"
        width="226.258"
        height="226.258"
        rx="42.4234"
        transform="rotate(45 153.987 47.9989)"
        stroke="currentColor"
        strokeWidth="21.2117"
        strokeMiterlimit="1"
        strokeDasharray="45.96 45.96"
      />
      <rect
        x="286.012"
        y="33"
        width="247.47"
        height="247.47"
        rx="53.0292"
        transform="rotate(45 286.012 33)"
        fill="currentColor"
      />
      <path
        d="M2523.54 349V65H2601.14V219.8L2691.54 143.4H2793.14L2695.14 223.4L2785.54 349H2690.34L2635.94 269.8L2601.14 298.2V349H2523.54Z"
        fill="currentColor"
      />
      <path
        d="M2363.33 353.8C2332.39 353.8 2305.46 349.667 2282.53 341.4C2259.86 333.133 2244.26 320.333 2235.73 303L2300.13 279.8C2302.26 283.267 2305.19 287 2308.93 291C2312.93 294.733 2319.19 297.933 2327.73 300.6C2336.26 303.267 2348.66 304.6 2364.93 304.6C2382.26 304.6 2396.13 303.533 2406.53 301.4C2417.19 299.267 2422.53 295.4 2422.53 289.8C2422.53 286.333 2420.93 283.667 2417.73 281.8C2414.79 279.667 2409.86 278.2 2402.93 277.4L2321.73 267.4C2307.06 265.533 2293.73 262.467 2281.73 258.2C2269.99 253.933 2260.66 247.8 2253.73 239.8C2247.06 231.8 2243.73 221.267 2243.73 208.2C2243.73 191.667 2248.79 178.333 2258.93 168.2C2269.33 157.8 2283.59 150.333 2301.73 145.8C2320.13 141 2341.06 138.6 2364.53 138.6C2395.46 138.6 2421.46 142.733 2442.53 151C2463.59 159.267 2478.93 172.6 2488.53 191L2426.13 208.6C2422.13 202.467 2415.73 197.533 2406.93 193.8C2398.39 189.8 2384.26 187.8 2364.53 187.8C2347.46 187.8 2334.66 189.133 2326.13 191.8C2317.59 194.2 2313.33 197.533 2313.33 201.8C2313.33 204.467 2314.79 206.867 2317.73 209C2320.66 211.133 2327.46 212.867 2338.13 214.2L2413.33 223.8C2429.59 225.667 2443.59 228.6 2455.33 232.6C2467.06 236.6 2476.13 242.467 2482.53 250.2C2488.93 257.933 2492.13 268.6 2492.13 282.2C2492.13 299 2486.53 312.733 2475.33 323.4C2464.13 333.8 2448.79 341.533 2429.33 346.6C2410.13 351.4 2388.13 353.8 2363.33 353.8Z"
        fill="currentColor"
      />
      <path
        d="M2130.59 117V61H2207.39V117H2130.59ZM2129.79 349V143.4H2207.39V349H2129.79Z"
        fill="currentColor"
      />
      <path
        d="M1775.94 349V65H1929.14C1966.74 65 1997.8 71.1333 2022.34 83.4C2047.14 95.6667 2065.67 112.6 2077.94 134.2C2090.2 155.533 2096.34 179.933 2096.34 207.4C2096.34 234.6 2090.2 258.867 2077.94 280.2C2065.67 301.533 2047.14 318.333 2022.34 330.6C1997.8 342.867 1966.74 349 1929.14 349H1775.94ZM1855.94 289.8H1923.54C1954.74 289.8 1977.8 282.867 1992.74 269C2007.94 255.133 2015.54 236.2 2015.54 212.2V201.8C2015.54 177.267 2007.94 158.2 1992.74 144.6C1977.8 131 1954.74 124.2 1923.54 124.2H1855.94V289.8Z"
        fill="currentColor"
      />
      <path
        d="M1492.29 349V65H1569.89V219.8L1660.29 143.4H1761.89L1663.89 223.4L1754.29 349H1659.09L1604.69 269.8L1569.89 298.2V349H1492.29Z"
        fill="currentColor"
      />
      <path
        d="M1203.62 349V143.4H1280.02V163C1297.08 146.733 1322.15 138.6 1355.22 138.6C1366.15 138.6 1377.35 139.8 1388.82 142.2C1400.28 144.6 1410.82 148.867 1420.42 155C1430.02 160.867 1437.75 169.133 1443.62 179.8C1449.75 190.2 1452.82 203.4 1452.82 219.4V349H1375.22V227.4C1375.22 215.133 1370.95 206.333 1362.42 201C1353.88 195.4 1342.55 192.6 1328.42 192.6C1314.28 192.6 1302.95 195.4 1294.42 201C1285.88 206.333 1281.48 215.133 1281.22 227.4V349H1203.62Z"
        fill="currentColor"
      />
      <path
        d="M1085.27 117V61H1162.07V117H1085.27ZM1084.47 349V143.4H1162.07V349H1084.47Z"
        fill="currentColor"
      />
      <path d="M965.334 349V65H1042.93V349H965.334Z" fill="currentColor" />
      <path
        d="M640 349V65H807.6C844.933 65 873.867 71.1333 894.4 83.4C914.933 95.6667 925.2 114.733 925.2 140.6C925.2 154.2 921.733 166.467 914.8 177.4C907.867 188.333 896.533 197 880.8 203.4C898.933 209.533 911.867 217.8 919.6 228.2C927.333 238.6 931.2 251.267 931.2 266.2C931.2 293.667 920.667 314.333 899.6 328.2C878.8 342.067 849.333 349 811.2 349H640ZM808 123H720V178.2H808C834.667 178.2 848 169.533 848 152.2V148.6C848 131.533 834.667 123 808 123ZM720 289.8H811.2C838.667 289.8 852.4 280.6 852.4 262.2V258.6C852.4 241.533 838.667 233 811.2 233H720V289.8Z"
        fill="currentColor"
      />
    </svg>
  );
}
