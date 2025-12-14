import { useTheme } from "@desktop/hooks/use-theme";
import { SkeletonTheme } from "@ui/skeleton";

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
