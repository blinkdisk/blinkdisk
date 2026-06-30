import { resolveStorageProviderType } from "@blinkdisk/constants/providers";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZVaultType } from "@blinkdisk/schemas/vault";
import { cn } from "@blinkdisk/utils/class";
import { providerIcons } from "@desktop/components/icons/providers/index";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { Link } from "@tanstack/react-router";

type VaultCardProps = {
  vault: ZVaultType;
};

export function VaultCard({ vault }: VaultCardProps) {
  const displayProviderType = resolveStorageProviderType(vault.provider);
  const Icon = providerIcons[displayProviderType];
  const { t } = useAppTranslation("vault");
  const { status, isLoading } = useVaultStatus(vault.id);
  const displayStatus = isLoading ? "STARTING" : (status ?? "STARTING");

  return (
    <Link
      to="/$accountId/$vaultId"
      from="/$accountId"
      params={(params) => ({ ...params, vaultId: vault.id })}
      className="bg-card hover:bg-card-hover rounded-xl border overflow-hidden shadow-xs flex flex-col justify-evenly gap-2 py-5 relative group"
    >
      <div className="flex items-center gap-5">
        <div className="h-8 w-2.5 bg-linear-to-b from-neutral-200 dark:from-neutral-900/50 to-black/5 dark:to-neutral-900/20 rounded-r-[0.4rem] p-1 pl-0">
          <div className="w-full h-full rounded-r-lg bg-white dark:bg-neutral-700 border border-l-0"></div>
        </div>
        <p className="truncate font-semibold text-xl">{vault.name}</p>
      </div>
      <div className="flex flex-col">
        <div className="w-full h-0.5 bg-neutral-200 dark:bg-neutral-900/50"></div>
        <div className="w-full h-0.5 bg-white dark:bg-neutral-700/50"></div>
      </div>
      <div className="flex items-center gap-5">
        <div className="h-8 w-2.5 bg-linear-to-b from-neutral-200 dark:from-neutral-900/50 to-black/5 dark:to-neutral-900/20 rounded-r-[0.4rem] p-1 pl-0">
          <div className="w-full h-full rounded-r-lg bg-white dark:bg-neutral-700 border border-l-0"></div>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <VaultStatusIndicator
              loading={isLoading}
              status={displayStatus}
              label={t(`status.${displayStatus}`)}
            />
            <p
              className={cn("text-sm", getVaultStatusTextClass(displayStatus))}
            >
              {t(`status.${displayStatus}`)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Icon className="size-4" />
            <p className="text-sm">
              {t(`providers.${displayProviderType}.shortName`)}
            </p>
          </div>
        </div>
      </div>
      <div className="absolute right-6">
        <div className="bg-neutral-100 dark:bg-neutral-800 size-18 rounded-full border-4 border-neutral-300 dark:border-neutral-700 shadow-xs relative p-0.5">
          <Ticks className="w-full h-full text-neutral-400 dark:text-neutral-500" />
          <div className="bg-neutral-200 dark:bg-neutral-700 size-11 rounded-full border-2 border-neutral-300 dark:border-neutral-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="w-28 h-3 absolute bg-white dark:bg-neutral-600 border-2 border-neutral-300 dark:border-neutral-800 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-lg rotate-45 group-hover:rotate-135 transition-transform"></div>
          <div className="w-28 h-3 absolute bg-white dark:bg-neutral-600 border-2 border-neutral-300 dark:border-neutral-800 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-lg -rotate-45 group-hover:rotate-45 transition-transform"></div>
          <div className="size-8 bg-white dark:bg-neutral-600 absolute rounded-full border-2 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 p-1.5 border-neutral-300 dark:border-neutral-800">
            <div className="bg-black/5 w-full h-full rounded-full"></div>
          </div>
        </div>
      </div>
    </Link>
  );
}

type VaultStatusIndicatorProps = {
  loading: boolean;
  status?: "SETUP" | "STARTING" | "RUNNING";
  label: string;
};

function getVaultStatusTextClass(status?: "SETUP" | "STARTING" | "RUNNING") {
  switch (status) {
    case "RUNNING":
      return "text-green-700 dark:text-green-500/85";
    case "STARTING":
      return "text-neutral-500 dark:text-neutral-400";
    case "SETUP":
      return "text-amber-600 dark:text-amber-300";
    default:
      return "text-neutral-500 dark:text-neutral-400";
  }
}

function VaultStatusIndicator({
  loading,
  status,
  label,
}: VaultStatusIndicatorProps) {
  const pending = loading || status === "STARTING";

  return (
    <output
      aria-label={label}
      title={label}
      className={cn(
        "size-2 shrink-0 rounded-full ring-2 ring-black/5 transition-colors dark:ring-white/5",
        status === "RUNNING" &&
          "bg-green-600/90 shadow-[0_0_5px_rgb(22_163_74_/_0.45)] dark:bg-green-500/80 dark:shadow-[0_0_4px_rgb(34_197_94_/_0.35)]",
        status === "STARTING" &&
          "bg-neutral-400/90 shadow-[0_0_5px_rgb(115_115_115_/_0.55)] dark:bg-neutral-400/90",
        status === "SETUP" &&
          "bg-amber-400/90 shadow-[0_0_5px_rgb(245_158_11_/_0.55)] dark:bg-amber-300/90",
        !status && "bg-neutral-400/80 dark:bg-neutral-500/80",
        pending && "animate-pulse",
      )}
    />
  );
}

type TicksProps = {
  className?: string;
};

function Ticks({ className }: TicksProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="460"
      height="461"
      viewBox="0 0 460 461"
      fill="none"
      className={className}
    >
      <title>Vault Ticks</title>
      <path
        d="M226.78 433.33C227.74 433.34 228.69 433.35 229.65 433.35V460.35L228.16 460.34C227.58 460.34 226.99 460.33 226.41 460.32L226.78 433.33ZM232.88 460.32C231.81 460.34 230.73 460.35 229.65 460.35V433.35C230.6 433.35 231.56 433.34 232.51 433.33L232.88 460.32ZM181.71 427.63C183.55 428.08 185.39 428.5 187.25 428.9L181.62 455.3C179.51 454.85 177.42 454.38 175.33 453.87L181.71 427.63ZM283.96 453.87C281.88 454.38 279.78 454.85 277.67 455.3L274.86 442.1L272.04 428.9C273.9 428.5 275.75 428.08 277.59 427.63L283.96 453.87ZM332.3 436.13C330.38 437.09 328.44 438.03 326.49 438.94L315.07 414.47C316.79 413.67 318.5 412.85 320.19 412L332.3 436.13ZM139.1 412C140.8 412.85 142.5 413.67 144.22 414.47L132.8 438.94C130.85 438.03 128.92 437.09 127 436.13L139.1 412ZM101.03 387.19C102.5 388.4 103.98 389.59 105.48 390.75L88.89 412.06C87.19 410.74 85.52 409.39 83.86 408.02L101.03 387.19ZM375.44 408.02C373.78 409.39 372.1 410.74 370.4 412.06L362.11 401.4L353.82 390.75C355.31 389.59 356.8 388.4 358.26 387.19L375.44 408.02ZM69.38 354.53C70.54 356.04 71.73 357.52 72.93 358.99L62.48 367.54L62.48 367.54L52.04 376.1C50.68 374.43 49.34 372.75 48.02 371.05L69.38 354.53ZM411.27 371.05C409.95 372.75 408.62 374.43 407.25 376.1L396.81 367.54L386.37 358.99C387.57 357.52 388.75 356.04 389.91 354.53L411.27 371.05ZM45.77 315.7C46.57 317.42 47.39 319.13 48.23 320.83L24.07 332.87C23.11 330.95 22.18 329.01 21.27 327.06L45.77 315.7ZM438.02 327.06C437.12 329.01 436.18 330.95 435.23 332.87L423.14 326.85L411.06 320.83C411.91 319.13 412.73 317.42 413.53 315.7L438.02 327.06ZM31.42 272.61C31.82 274.47 32.24 276.32 32.68 278.16L6.43 284.5C5.93 282.41 5.45 280.31 5.01 278.2L31.42 272.61ZM454.29 278.2C453.84 280.31 453.36 282.41 452.86 284.5L426.62 278.16C427.06 276.32 427.48 274.47 427.87 272.61L454.29 278.2ZM0 230.17C1.35e-06 229.18 0.01 228.19 0.02 227.2L0.02 226.94L27.02 227.31C27.01 228.26 27 229.22 27 230.17C27 231.13 27.01 232.09 27.02 233.04L0.02 233.41C0.01 232.33 0 231.25 0 230.17ZM459.3 230.17C459.3 231.25 459.29 232.33 459.27 233.41L432.27 233.04C432.29 232.09 432.3 231.13 432.3 230.17C432.3 229.22 432.29 228.26 432.27 227.31L459.27 226.94C459.29 228.01 459.3 229.09 459.3 230.17ZM6.43 175.85L32.68 182.19C32.24 184.03 31.82 185.88 31.42 187.74L18.21 184.94L5.01 182.14C5.39 180.35 5.79 178.57 6.21 176.8L6.43 175.85ZM452.86 175.85C453.36 177.94 453.84 180.03 454.29 182.14L441.08 184.94L441.08 184.94L427.87 187.74C427.48 185.88 427.06 184.03 426.62 182.19L452.86 175.85ZM48.23 139.52C47.39 141.21 46.57 142.92 45.77 144.65L21.27 133.29C22.18 131.34 23.11 129.4 24.07 127.48L48.23 139.52ZM435.23 127.48C436.18 129.4 437.12 131.34 438.02 133.29L413.53 144.65C412.73 142.92 411.91 141.21 411.06 139.52L435.23 127.48ZM72.93 101.36C71.73 102.82 70.55 104.31 69.38 105.81L48.02 89.3C49.34 87.59 50.68 85.91 52.04 84.25L72.93 101.36ZM407.25 84.25C408.62 85.91 409.95 87.59 411.27 89.3L389.91 105.81C388.75 104.31 387.57 102.82 386.37 101.36L407.25 84.25ZM88.89 48.29L105.48 69.59C103.98 70.76 102.5 71.95 101.03 73.16L83.86 52.32C85.18 51.23 86.52 50.15 87.87 49.09L88.89 48.29ZM370.4 48.29C372.1 49.61 373.78 50.96 375.44 52.32L358.26 73.16C356.8 71.95 355.31 70.76 353.82 69.59L370.4 48.29ZM144.22 45.87C142.5 46.68 140.8 47.5 139.1 48.35L127 24.22C128.92 23.25 130.85 22.32 132.8 21.41L144.22 45.87ZM326.49 21.41C328.44 22.32 330.38 23.25 332.3 24.22L320.19 48.35C318.5 47.5 316.79 46.68 315.07 45.87L326.49 21.41ZM187.25 31.45C185.39 31.84 183.55 32.27 181.71 32.71L175.33 6.48C177.42 5.97 179.51 5.49 181.62 5.04L187.25 31.45ZM277.67 5.04C279.78 5.49 281.88 5.97 283.96 6.48L277.59 32.71C275.75 32.27 273.9 31.84 272.04 31.45L277.67 5.04ZM229.65 0C230.73 0 231.81 0.01 232.88 0.02L232.7 13.52L232.7 13.52L232.51 27.02C231.56 27.01 230.6 27 229.65 27C228.69 27 227.74 27.01 226.78 27.02L226.41 0.02C227.49 0.01 228.57 9.16e-07 229.65 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
