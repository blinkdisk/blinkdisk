import { Logo } from "@blinkdisk/components/logo";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ManualToast } from "@web/components/auth/manual";
import { authClient } from "@web/lib/auth";
import { useEffect } from "react";
import { toast } from "sonner";
export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    const authorizationCode = authClient.electron.getAuthorizationCode();
    if (authorizationCode) {
      setTimeout(() => {
        toast.custom(
          (t) => <ManualToast t={t} authorizationCode={authorizationCode} />,
          {
            duration: 4_000,
          },
        );
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const id = authClient.ensureElectronRedirect();
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-screen w-screen">
      <div className="w-1/2 2xl:w-[40vw]">
        <div
          style={{
            backgroundImage: `url("/images/auth.jpg")`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          className="fixed inset-y-2 left-2 w-[calc(50vw-1rem)] rounded-2xl bg-[#3C26C7] 2xl:w-[calc(40vw-1rem)]"
        ></div>
        <Logo theme="dark" className="h-6.5 fixed left-10 top-10" />
      </div>
      <div className="flex h-screen w-1/2 flex-col items-center py-24 2xl:w-[60vw]">
        <div className="mt-auto"></div>
        <Outlet />
        <div className="mb-auto"></div>
      </div>
    </div>
  );
}
