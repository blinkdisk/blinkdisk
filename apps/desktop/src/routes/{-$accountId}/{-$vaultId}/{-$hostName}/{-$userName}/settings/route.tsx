import { cn } from "@blinkdisk/utils/class";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/settings",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  const isPolicyPage = pathname.endsWith("/settings/policies");

  return (
    <div
      className={cn(
        "flex min-h-full flex-col overflow-y-auto px-6 md:px-8",
        isPolicyPage ? "py-6 md:py-8" : "py-12 md:py-16",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-10",
          isPolicyPage ? "max-w-[80rem]" : "max-w-[46rem]",
        )}
      >
        <Outlet />
      </div>
    </div>
  );
}
