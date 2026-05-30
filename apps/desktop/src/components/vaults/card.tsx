import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZVaultType } from "@blinkdisk/schemas/vault";
import { providerIcons } from "@desktop/components/icons/providers/index";
import { Link } from "@tanstack/react-router";

type VaultCardProps = {
  vault: ZVaultType;
};

export function VaultCard({ vault }: VaultCardProps) {
  const Icon = providerIcons[vault.provider];
  const { t } = useAppTranslation("vault");

  return (
    <Link
      to="/{-$accountId}/{-$vaultId}"
      params={(params) => ({ ...params, vaultId: vault.id })}
      className="bg-card hover:bg-card-hover rounded-xl border overflow-hidden shadow-xs flex flex-col justify-evenly gap-2 py-5 relative group"
    >
      <div className="flex items-center gap-5">
        <div className="h-8 w-2.5 bg-linear-to-b from-neutral-200 dark:from-neutral-900/50 to-black/5 dark:to-neutral-900/20 rounded-r-[0.4rem] p-1 pl-0">
          <div className="w-full h-full rounded-r-lg bg-white dark:bg-neutral-700 border border-l-0"></div>
        </div>
        <p className="font-semibold text-xl">{vault.name}</p>
      </div>
      <div className="flex flex-col">
        <div className="w-full h-0.5 bg-neutral-200 dark:bg-neutral-900/50"></div>
        <div className="w-full h-0.5 bg-white dark:bg-neutral-700/50"></div>
      </div>
      <div className="flex items-center gap-5">
        <div className="h-8 w-2.5 bg-linear-to-b from-neutral-200 dark:from-neutral-900/50 to-black/5 dark:to-neutral-900/20 rounded-r-[0.4rem] p-1 pl-0">
          <div className="w-full h-full rounded-r-lg bg-white dark:bg-neutral-700 border border-l-0"></div>
        </div>
        <div className="flex gap-2 items-center text-muted-foreground">
          <Icon className="size-4" />
          <p className="text-sm">{t(`providers.${vault.provider}.name`)}</p>
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
        d="M226.783 433.326C227.736 433.339 228.691 433.347 229.647 433.347V460.347L228.162 460.342C227.577 460.338 226.993 460.33 226.409 460.322L226.783 433.326ZM232.885 460.322C231.807 460.337 230.728 460.347 229.647 460.347V433.347C230.604 433.347 231.559 433.339 232.512 433.326L232.885 460.322ZM181.708 427.634C183.546 428.081 185.394 428.502 187.252 428.898L181.621 455.304C179.513 454.854 177.416 454.376 175.33 453.869L181.708 427.634ZM283.964 453.869C281.878 454.376 279.781 454.854 277.674 455.304L274.858 442.102L272.043 428.898C273.901 428.502 275.749 428.081 277.588 427.634L283.964 453.869ZM332.296 436.127C330.376 437.09 328.441 438.028 326.49 438.938L315.071 414.474C316.79 413.671 318.497 412.845 320.189 411.996L332.296 436.127ZM139.105 411.996C140.798 412.845 142.505 413.671 144.225 414.474L132.804 438.938C130.854 438.027 128.919 437.091 126.999 436.128L139.105 411.996ZM101.034 387.191C102.498 388.399 103.98 389.586 105.479 390.752L88.8916 412.056C87.195 410.735 85.5175 409.39 83.8594 408.023L101.034 387.191ZM375.436 408.023C373.777 409.39 372.1 410.735 370.403 412.056L362.11 401.404L353.817 390.752C355.315 389.586 356.797 388.399 358.261 387.191L375.436 408.023ZM69.3828 354.534C70.5445 356.037 71.7273 357.523 72.9297 358.991L62.4834 367.543L62.4844 367.544L52.0391 376.095C50.6779 374.432 49.3395 372.751 48.0244 371.05L69.3828 354.534ZM411.271 371.05C409.955 372.751 408.616 374.432 407.255 376.095L396.811 367.544L386.365 358.991C387.568 357.523 388.75 356.036 389.912 354.534L411.271 371.05ZM45.7695 315.7C46.568 317.423 47.3894 319.132 48.2344 320.828L24.0693 332.868C23.1116 330.946 22.1796 329.008 21.2744 327.056L45.7695 315.7ZM438.021 327.056C437.115 329.008 436.183 330.946 435.226 332.868L423.144 326.849L411.061 320.828C411.906 319.132 412.728 317.423 413.526 315.7L438.021 327.056ZM31.4219 272.61C31.8158 274.47 32.2354 276.321 32.6797 278.162L6.43359 284.497C5.92978 282.41 5.45444 280.312 5.00781 278.203L31.4219 272.61ZM454.287 278.203C453.84 280.312 453.364 282.41 452.86 284.497L426.616 278.162C427.061 276.321 427.48 274.471 427.874 272.61L454.287 278.203ZM0 230.173C1.34973e-06 229.18 0.00604299 228.188 0.0185547 227.198L0.0224609 226.935L27.0195 227.307C27.0064 228.26 27 229.216 27 230.173C27 231.13 27.0064 232.086 27.0195 233.04L0.0224609 233.41C0.00764612 232.333 0 231.254 0 230.173ZM459.295 230.173C459.295 231.254 459.286 232.333 459.271 233.41L432.275 233.04C432.289 232.086 432.295 231.13 432.295 230.173C432.295 229.216 432.289 228.26 432.275 227.307L459.271 226.935C459.286 228.012 459.295 229.092 459.295 230.173ZM6.43359 175.849L32.6797 182.185C32.2353 184.025 31.8159 185.876 31.4219 187.736L18.2148 184.938L5.00781 182.142C5.38651 180.354 5.78523 178.573 6.20508 176.801L6.43359 175.849ZM452.86 175.849C453.364 177.935 453.841 180.033 454.287 182.142L441.081 184.939L441.08 184.938L427.874 187.736C427.48 185.876 427.061 184.025 426.616 182.185L452.86 175.849ZM48.2344 139.518C47.3893 141.214 46.5681 142.924 45.7695 144.646L21.2734 133.29C22.1787 131.338 23.1106 129.4 24.0684 127.478L48.2344 139.518ZM435.227 127.478C436.184 129.4 437.115 131.338 438.021 133.29L413.526 144.646C412.728 142.924 411.906 141.214 411.061 139.518L435.227 127.478ZM72.9297 101.355C71.7274 102.824 70.5453 104.309 69.3838 105.812L48.0244 89.2959C49.3398 87.5948 50.6786 85.9127 52.04 84.25L72.9297 101.355ZM407.255 84.25C408.616 85.9127 409.955 87.5948 411.271 89.2959L389.912 105.812C388.751 104.309 387.568 102.824 386.365 101.355L407.255 84.25ZM88.8916 48.29L105.479 69.5947C103.98 70.761 102.498 71.9481 101.034 73.1553L83.8594 52.3223C85.1828 51.2312 86.5183 50.1545 87.8662 49.0928L88.8916 48.29ZM370.403 48.29C372.1 49.6109 373.777 50.9552 375.436 52.3223L358.261 73.1553C356.797 71.9481 355.315 70.761 353.817 69.5947L370.403 48.29ZM144.225 45.873C142.505 46.6756 140.798 47.5013 139.105 48.3506L126.999 24.2178C128.919 23.2547 130.854 22.3175 132.804 21.4072L144.225 45.873ZM326.491 21.4062C328.441 22.3166 330.376 23.2546 332.296 24.2178L320.189 48.3506C318.497 47.5014 316.79 46.6755 315.071 45.873L326.491 21.4062ZM187.252 31.4473C185.394 31.8434 183.546 32.2651 181.708 32.7119L175.33 6.47656C177.416 5.9695 179.513 5.49054 181.621 5.04102L187.252 31.4473ZM277.674 5.04102C279.781 5.49047 281.878 5.96958 283.964 6.47656L277.588 32.7119C275.749 32.265 273.901 31.8435 272.043 31.4473L277.674 5.04102ZM229.647 0C230.728 0 231.808 0.00754319 232.885 0.0224609L232.699 13.5215L232.698 13.5205L232.512 27.0195C231.559 27.0063 230.604 27 229.647 27C228.691 27 227.736 27.0063 226.783 27.0195L226.409 0.0224609C227.487 0.00753133 228.566 9.16225e-07 229.647 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
