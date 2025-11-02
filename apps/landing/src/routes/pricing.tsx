import { BillingPeriod, plans } from "@config/plans";
import { FREE_SPACE_AVAILABLE } from "@config/space";
import { usePlanPrices } from "@hooks/use-plan-prices";
import { useTheme } from "@hooks/use-theme";
import { FilesystemIcon } from "@landing/components/icons/filesystem";
import { NASIcon } from "@landing/components/icons/nas";
import { S3CompatibleIcon } from "@landing/components/icons/s3-compatible";
import { SftpIcon } from "@landing/components/icons/sftp";
import { WebdavIcon } from "@landing/components/icons/webdav";
import { head } from "@landing/utils/head";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { cn } from "@utils/class";
import { ArrowLeftIcon, CheckIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import logoDark from "../assets/brand/logo-dark.svg";
import logoLight from "../assets/brand/logo-light.svg";

export const Route = createFileRoute("/pricing")({
  component: RouteComponent,
  head: head({
    title: "Pricing",
    description:
      "The plans & pricing for BlinkDisk. All powerful backup features are free, and you only pay for the storage you use.",
  }),
});

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
    icon: FilesystemIcon,
  },
  {
    name: "Network Attached Storage",
    description: "Use your home or office NAS",
    icon: NASIcon,
  },
  {
    name: "S3 Compatible",
    description: "Any S3-compatible service",
    icon: S3CompatibleIcon,
  },
  {
    name: "SFTP",
    description: "Backup to secure SFTP server",
    icon: SftpIcon,
  },
  {
    name: "WebDAV",
    description: "Use any WebDAV server",
    icon: WebdavIcon,
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
    description: "Azure’s cloud storage option",
    image: "azure-blob-storage.svg",
  },
];

const currency = "USD";

function RouteComponent() {
  const { dark } = useTheme();

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
        you use. Here’s a quick look at what’s included.
      </p>
      <div className="mt-12 grid max-w-[90vw] grid-cols-2 gap-4 md:max-w-5xl md:grid-cols-3 md:gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={cn("flex flex-col gap-3 md:flex-row", {
              "hidden md:flex": feature.hideOnMobile,
            })}
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
              <img
                src={dark ? logoDark : logoLight}
                className="h-6 select-none"
                draggable={false}
              />
              <Badge variant="muted" className="px-2 py-0.5 text-sm">
                <span className="sr-only">Cloud</span>
                Cloud
              </Badge>
            </div>
            <Tabs
              value={period}
              onValueChange={(to) => setPeriod(to as BillingPeriod)}
              className="mt-6 sm:mt-0"
            >
              <TabsList>
                <TabsTrigger className="px-6" value="MONTHLY">
                  Monthly
                </TabsTrigger>
                <TabsTrigger className="px-3" value="YEARLY">
                  Yearly
                  <Badge variant="subtle">Save ~25%</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
                  <storageOption.icon className="mx-1 size-5" />
                ) : (
                  <img
                    src={`/images/providers/${storageOption.image}`}
                    className="size-7 grayscale"
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
                <Button
                  size="icon-xs"
                  variant="outline"
                  onClick={() => setGroupIndex((groupIndex || 0) - 1)}
                  disabled={groupIndex === 0}
                >
                  <MinusIcon className="size-4" />
                </Button>
              ) : null}
              <p className="text-center text-3xl font-bold">
                {plan.storageGB.toLocaleString()} GB
              </p>
              {setGroupIndex ? (
                <Button
                  size="icon-xs"
                  onClick={() =>
                    groupIndex === maxGroupIndex
                      ? setContact(true)
                      : setGroupIndex((groupIndex || 0) + 1)
                  }
                  disabled={contact}
                >
                  <PlusIcon className="size-4" />
                </Button>
              ) : null}
            </div>
            {!contact ? (
              <p className="text-muted-foreground mt-1 text-center text-xs">
                Enjoy {plan.storageGB.toLocaleString()} GB of cloud storage
              </p>
            ) : null}
          </>
        ) : (
          <Button onClick={() => setContact(false)} variant="outline" size="sm">
            <ArrowLeftIcon className="size-4" />
            Go Back
          </Button>
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
        <Button
          onClick={() => window.open("mailto:cloud@blinkdisk.com")}
          className="w-full"
        >
          Contact Us
        </Button>
      ) : null}
    </div>
  );
}
