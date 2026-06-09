import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { useIsMobile } from "@blinkdisk/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@blinkdisk/ui/dropdown-menu";
import { useAuth } from "@desktop/hooks/use-auth";
import { UserPlusIcon } from "lucide-react";
import type { ReactElement } from "react";

export type AccountMenuDropdownProps = {
  children: ReactElement;
};

export function AccountMenuDropdown({ children }: AccountMenuDropdownProps) {
  const { t } = useAppTranslation("sidebar");

  const isMobile = useIsMobile();

  const { addAccount } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={children} />
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuItem onClick={addAccount}>
          <UserPlusIcon />
          {t("accountMenu.addAccount")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
