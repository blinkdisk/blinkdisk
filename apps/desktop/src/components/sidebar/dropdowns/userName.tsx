import { useVaultProfiles } from "@desktop/hooks/queries/core/use-vault-profiles";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { useProfile } from "@desktop/hooks/use-profile";
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
import { ChevronDownIcon, UserIcon } from "lucide-react";
import { useMemo } from "react";

type SidebarUserNameSelectProps = {
  className?: string;
};

export function SidebarUserNameSelect({
  className,
}: SidebarUserNameSelectProps) {
  const { t } = useAppTranslation("sidebar.selectUserName");

  const { data: profiles } = useVaultProfiles();

  const { localUserName } = useLocalProfile();
  const { userName, hostName, changeUserName } = useProfile();

  const userNames = useMemo(
    () => profiles?.find((profile) => profile.hostName === hostName)?.userNames,
    [profiles, hostName],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "border-input flex w-full select-none items-center justify-between gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-sm outline-none transition-colors bg-sidebar-secondary hover:bg-sidebar-secondary-hover border-sidebar-secondary-border focus:z-10 h-11",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <UserIcon className="size-4.25 shrink-0" />
          <span className="truncate">{userName || t("empty")}</span>
          {localUserName && userName && userName !== localUserName ? (
            <Badge variant="subtle">{t("remote")}</Badge>
          ) : null}
        </div>
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {userNames?.map(({ userName: name }) => (
            <DropdownMenuItem key={name} onClick={() => changeUserName(name)}>
              {name}
              {localUserName && name !== localUserName ? (
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
