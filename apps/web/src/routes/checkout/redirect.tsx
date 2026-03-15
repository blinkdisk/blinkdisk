import { Loader } from "@blinkdisk/ui/loader";
import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@web/lib/trpc";
import { useEffect } from "react";

const ALLOWED_REDIRECT_HOSTS = [
  "polar.sh",
  "sandbox.polar.sh",
  "checkout.polar.sh",
];

function isAllowedRedirectUrl(url: string) {
  try {
    const parsed = new URL(url);
    return ALLOWED_REDIRECT_HOSTS.some(
      (host) =>
        parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/checkout/redirect")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    const timeout = setTimeout(async () => {
      const params = new URLSearchParams(window.location.search);
      const url = params.get("url");
      const id = params.get("id");

      if (!url || !isAllowedRedirectUrl(url)) {
        window.location.href = "/";
        return;
      }

      const endorselyReferral = (
        window as unknown as { endorsely_referral?: string }
      ).endorsely_referral;

      if (id && endorselyReferral) {
        try {
          await trpc.affiliate.linkCheckout.mutate({
            checkoutId: id,
            affiliateId: endorselyReferral,
          });
        } catch (e) {
          console.error("Failed to link affiliate checkout:", e);
        }
      }

      window.location.href = url;
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader size={1.75} />
    </div>
  );
}
