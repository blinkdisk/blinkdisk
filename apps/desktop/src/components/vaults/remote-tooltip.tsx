import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { LockIcon } from "lucide-react";

type RemoteTooltipProps = {
  children: React.ReactNode;
};

export function RemoteTooltip({ children }: RemoteTooltipProps) {
  const { t } = useAppTranslation("vault.remoteTooltip");
  const { remote } = useLocalProfile();

  if (!remote) return children;
  return (
    <Tooltip>
      <TooltipContent className="max-w-55 rounded-lg p-4">
        <div className="flex items-center gap-1">
          <LockIcon className="mr-1 size-4" />
          <p className="font-medium">{t("title")}</p>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">{t("description")}</p>
      </TooltipContent>
      <TooltipTrigger asChild>
        <span tabIndex={0}>{children}</span>
      </TooltipTrigger>
    </Tooltip>
  );
}
