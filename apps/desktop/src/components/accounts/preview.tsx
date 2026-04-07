import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Avatar, AvatarFallback } from "@blinkdisk/ui/avatar";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { HatGlassesIcon } from "lucide-react";
import { useMemo } from "react";

type AccountPreviewProps = {
  account?: {
    user: {
      name: string;
      email: string;
    };
  } | null;
  local?: boolean;
};

export function AccountPreview({ account, local }: AccountPreviewProps) {
  const { t } = useAppTranslation("auth.account");

  const initials = useMemo(() => {
    return account?.user.name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("");
  }, [account]);

  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="size-9 rounded-lg after:rounded-lg">
        <AvatarFallback className="rounded-lg">
          {local ? <HatGlassesIcon /> : initials ? initials : ""}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate text-[0.875rem] font-semibold">
          {local ? (
            t("local.name")
          ) : account?.user ? (
            account.user.name
          ) : (
            <Skeleton width={130} />
          )}
        </span>
        <span className="truncate text-xs">
          {local ? (
            t("local.description")
          ) : account?.user ? (
            account.user.email
          ) : (
            <Skeleton width={100} />
          )}
        </span>
      </div>
    </div>
  );
}
