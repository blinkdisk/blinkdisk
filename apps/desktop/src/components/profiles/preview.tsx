import { DeviceItem } from "@desktop/hooks/queries/use-device-list";
import { ProfileItem } from "@desktop/hooks/queries/use-profile-list";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@utils/class";
import { UserIcon } from "lucide-react";

type ProfilePreviewProps = {
  profile: ProfileItem | undefined;
  device: DeviceItem | undefined;
  className?: string;
};

export function ProfilePreview({
  profile,
  device,
  className,
}: ProfilePreviewProps) {
  return (
    <div className={cn("flex w-full items-center gap-3", className)}>
      <UserIcon
        className={cn(
          "text-muted-foreground shrink-0",
          device ? "size-6" : "size-4",
        )}
      />
      <div className="flex min-w-0 max-w-full flex-col items-start">
        <p className="max-w-full truncate text-sm">
          {profile ? profile.alias : <Skeleton width="6rem" />}
        </p>
        {device ? (
          <p className="text-muted-foreground max-w-full truncate text-sm">
            {device.alias}
          </p>
        ) : null}
      </div>
    </div>
  );
}
