import { useVaultProfiles } from "#hooks/queries/core/use-vault-profiles";
import { useLocalProfile } from "#hooks/use-local-profile";
import { useProfile } from "#hooks/use-profile";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Badge } from "@ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { cn } from "@utils/class";
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
          "border-input flex w-full select-none items-center justify-between gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-sm outline-none transition-colors bg-sidebar-secondary hover:bg-sidebar-secondary-hover border-sidebar-secondary-border focus:z-10 h-11",
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
