import { linkAffiliateCheckoutFn } from "@landing/server/affiliate";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader } from "@ui/loader";
import { useEffect } from "react";
import { z } from "zod";

export const Route = createFileRoute("/checkout/redirect")({
  component: RouteComponent,
  validateSearch: z.object({
    id: z.string().optional(),
    url: z.string().min(1),
  }),
});

function RouteComponent() {
  const search = Route.useSearch();
  const linkAffiliateCheckout = useServerFn(linkAffiliateCheckoutFn);

  useEffect(() => {
    (async () => {
      if (!search.url) return;

      if (search.id && window.endorsely_referral) {
        try {
          await linkAffiliateCheckout({
            data: {
              checkoutId: search.id,
              affiliateId: window.endorsely_referral,
            },
          });
        } catch (e) {
          console.error("Failed to link affiliate checkout:", e);
        }
      }

      window.location.href = search.url;
    })();
  }, [search, linkAffiliateCheckout]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader />
    </div>
  );
}
