import { useVaultProfiles } from "@desktop/hooks/queries/core/use-vault-profiles";
import { useProfile } from "@desktop/hooks/use-profile";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Badge } from "@ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { cn } from "@utils/class";
import { UserIcon } from "lucide-react";
import { useMemo } from "react";

type SidebarUserNameSelectProps = {
  className?: string;
};

export function SidebarUserNameSelect({
  className,
}: SidebarUserNameSelectProps) {
  const { t } = useAppTranslation("sidebar.selectUserName");

  const { data: profiles } = useVaultProfiles();
  const { localUserName, userName, hostName, changeUserName } = useProfile();

  const userNames = useMemo(
    () => profiles?.find((profile) => profile.hostName === hostName)?.userNames,
    [profiles, hostName],
  );

  return (
    <Select
      // The fallback prevents it from being uncontrolled
      value={userName || "-"}
      onValueChange={changeUserName}
    >
      <SelectTrigger
        className={cn(
          "bg-sidebar-muted border-sidebar-border focus:z-10",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <UserIcon className="size-4.25 shrink-0" />
          <SelectValue placeholder={t("empty")} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {userNames?.map(({ userName }) => (
          <SelectItem key={userName} value={userName}>
            {userName}
            {userName !== localUserName ? (
              <Badge variant="subtle" className="ml-1.5">
                {t("remote")}
              </Badge>
            ) : null}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
