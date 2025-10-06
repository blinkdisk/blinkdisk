import { useTheme } from "@hooks/use-theme";
import SkeletonComponent, {
  SkeletonTheme as SkeletonThemeComponent,
} from "react-loading-skeleton";

const Skeleton = SkeletonComponent;

type SkeletonThemeProps = {
  children: React.ReactNode;
  baseColor?: string;
  highlightColor?: string;
};

function SkeletonTheme({
  children,
  baseColor,
  highlightColor,
}: SkeletonThemeProps) {
  const { dark } = useTheme();

  return (
    <SkeletonThemeComponent
      baseColor={baseColor ? baseColor : dark ? "#2b2b2b" : "#d6d6d6"}
      highlightColor={
        highlightColor ? highlightColor : dark ? "#4a4a4a" : "#e6e6e6"
      }
    >
      {children}
    </SkeletonThemeComponent>
  );
}
SkeletonTheme.displayName = "SkeletonTheme";

export { Skeleton, SkeletonTheme };
