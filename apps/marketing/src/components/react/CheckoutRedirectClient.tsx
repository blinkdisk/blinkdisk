import { useEffect } from "react";
import { Loader } from "@ui/loader";

const ALLOWED_REDIRECT_HOSTS = [
  "polar.sh",
  "sandbox.polar.sh",
  "checkout.polar.sh",
];

function isAllowedRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_REDIRECT_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

export default function CheckoutRedirectClient() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    const id = params.get("id");

    (async () => {
      if (!url || !isAllowedRedirectUrl(url)) {
        window.location.href = "/";
        return;
      }

      if (id && window.endorsely_referral) {
        try {
          await fetch("/api/affiliate/link", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              checkoutId: id,
              affiliateId: window.endorsely_referral,
            }),
          });
        } catch (e) {
          console.error("Failed to link affiliate checkout:", e);
        }
      }

      window.location.href = url;
    })();
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader />
    </div>
  );
}
