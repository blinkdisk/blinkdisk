import { useDeviceProfileList } from "@desktop/hooks/queries/use-device-profile-list";
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

type SidebarProfileSelectProps = {
  className?: string;
};

export function SidebarProfileSelect({ className }: SidebarProfileSelectProps) {
  const { t } = useAppTranslation("sidebar.selectProfile");

  const { data: profiles } = useDeviceProfileList();
  const { localProfileId, profileId, changeProfile } = useProfile();

  return (
    <Select value={profileId} onValueChange={changeProfile}>
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
        {profiles?.map((profile) => (
          <SelectItem key={profile.id} value={profile.id}>
            {profile.alias}
            {localProfileId && profile.id !== localProfileId ? (
              <Badge variant="subtle" className="ml-1.5">
                {t("external")}
              </Badge>
            ) : null}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
