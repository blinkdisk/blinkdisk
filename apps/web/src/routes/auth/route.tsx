import { Logo } from "@blinkdisk/components/logo";
import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen w-full items-center justify-between">
      <div className="relative hidden h-full min-h-screen w-1/2 md:block 2xl:w-[40%]">
        <div
          style={{
            backgroundImage: `url("/images/auth.jpg")`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          className="absolute inset-2 left-2 rounded-2xl bg-[#3C26C7]"
        ></div>
        <Logo theme="dark" className="h-6.5 fixed left-10 top-10" />
      </div>
      <div className="flex w-full flex-col items-center py-24 md:w-1/2 2xl:w-[60%]">
        <Outlet />
      </div>
    </div>
  );
}
