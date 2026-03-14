import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Badge } from "@blinkdisk/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@blinkdisk/ui/dropdown-menu";
import { cn } from "@blinkdisk/utils/class";
import { useVaultProfiles } from "@desktop/hooks/queries/core/use-vault-profiles";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { useProfile } from "@desktop/hooks/use-profile";
import { ChevronDownIcon, MonitorIcon } from "lucide-react";

type SidebarHostNameSelectProps = {
  className?: string;
};

export function SidebarHostNameSelect({
  className,
}: SidebarHostNameSelectProps) {
  const { t } = useAppTranslation("sidebar.selectHostName");

  const { localHostName } = useLocalProfile();
  const { hostName, changeHostName } = useProfile();

  const { data: profiles } = useVaultProfiles();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "border-input bg-sidebar-secondary hover:bg-sidebar-secondary-hover border-sidebar-secondary-border flex h-11 w-full select-none items-center justify-between gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:z-10",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <MonitorIcon className="size-4.25 shrink-0" />
          <span className="truncate">{hostName || t("empty")}</span>
          {localHostName && hostName && hostName !== localHostName ? (
            <Badge variant="subtle">{t("remote")}</Badge>
          ) : null}
        </div>
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {profiles?.map(({ hostName: name }) => (
            <DropdownMenuItem key={name} onClick={() => changeHostName(name)}>
              {name}
              {localHostName && name !== localHostName ? (
                <Badge variant="subtle" className="ml-1.5">
                  {t("remote")}
                </Badge>
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
