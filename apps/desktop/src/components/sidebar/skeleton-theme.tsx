import { SkeletonTheme } from "@blinkdisk/ui/skeleton";
import { useTheme } from "@desktop/hooks/use-theme";

export type SidebarSkeletonThemeProps = {
  children: React.ReactNode;
};

export function SidebarSkeletonTheme({ children }: SidebarSkeletonThemeProps) {
  const { dark } = useTheme();

  return (
    <SkeletonTheme baseColor={dark ? undefined : "#d4d4d4"} dark={dark}>
      {children}
    </SkeletonTheme>
  );
}
