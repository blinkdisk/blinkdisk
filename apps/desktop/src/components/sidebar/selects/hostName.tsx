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
import { MonitorIcon } from "lucide-react";

type SidebarHostNameSelectProps = {
  className?: string;
};

export function SidebarHostNameSelect({
  className,
}: SidebarHostNameSelectProps) {
  const { t } = useAppTranslation("sidebar.selectHostName");

  const { hostName, changeHostName, localHostName } = useProfile();

  const { data: profiles } = useVaultProfiles();

  return (
    <Select value={hostName} onValueChange={changeHostName}>
      <SelectTrigger
        className={cn(
          "bg-sidebar-muted border-sidebar-border focus:z-10",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <MonitorIcon className="size-4.25 shrink-0" />
          <SelectValue placeholder={t("empty")} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {profiles?.map(({ hostName }) => (
          <SelectItem key={hostName} value={hostName}>
            {hostName}
            {hostName !== localHostName ? (
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
