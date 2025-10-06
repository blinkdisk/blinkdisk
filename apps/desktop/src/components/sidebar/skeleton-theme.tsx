import { useTheme } from "@hooks/use-theme";
import { SkeletonTheme } from "@ui/skeleton";

export type SidebarSkeletonThemeProps = {
  children: React.ReactNode;
};

export function SidebarSkeletonTheme({ children }: SidebarSkeletonThemeProps) {
  const { light } = useTheme();

  return (
    <SkeletonTheme baseColor={light ? "#d4d4d4" : undefined}>
      {children}
    </SkeletonTheme>
  );
}
