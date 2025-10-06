import { Avatar, AvatarFallback } from "@ui/avatar";
import { Skeleton } from "@ui/skeleton";
import { useMemo } from "react";

type AccountPreviewProps = {
  account?: {
    user: {
      name: string;
      email: string;
    };
  } | null;
};

export function AccountPreview({ account }: AccountPreviewProps) {
  const initials = useMemo(() => {
    return account?.user.name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("");
  }, [account]);

  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="size-9 rounded-lg">
        <AvatarFallback className="rounded-lg">
          {initials ? initials : ""}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate text-[0.875rem] font-semibold">
          {account?.user ? account.user.name : <Skeleton width={130} />}
        </span>
        <span className="truncate text-xs">
          {account?.user ? account.user.email : <Skeleton width={100} />}
        </span>
      </div>
    </div>
  );
}
