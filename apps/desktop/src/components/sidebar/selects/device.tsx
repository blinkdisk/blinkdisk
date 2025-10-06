import { useDeviceList } from "@desktop/hooks/queries/use-device-list";
import { useDevice } from "@desktop/hooks/use-device";
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

type SidebarDeviceSelectProps = {
  className?: string;
};

export function SidebarDeviceSelect({ className }: SidebarDeviceSelectProps) {
  const { t } = useAppTranslation("sidebar.selectDevice");

  const { data: devices } = useDeviceList();
  const { localDeviceId, deviceId, changeDevice } = useDevice();

  return (
    <Select value={deviceId} onValueChange={changeDevice}>
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
        {devices?.map((device) => (
          <SelectItem key={device.id} value={device.id}>
            {device.alias}
            {localDeviceId && device.id !== localDeviceId ? (
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
