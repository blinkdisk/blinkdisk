import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { useClipboard } from "@blinkdisk/hooks/use-clipboard";
import { Button } from "@blinkdisk/ui/button";
import { Loader } from "@blinkdisk/ui/loader";
import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "@web/lib/auth";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Trans } from "react-i18next";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/success")({
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();

  const { t } = useAppTranslation("auth.success");
  const { copy } = useClipboard();
  const [waiting, setWaiting] = useState(true);
  const [code, setLoadedCode] = useState<string | null>();

  useEffect(() => {
    const timeout = setTimeout(() => setWaiting(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const authCode = authClient.electron.getAuthorizationCode();
    if (!authCode) return;
    setLoadedCode(authCode);
  }, []);

  useEffect(() => {
    // Only listen while waiting to prevent
    // other tabs catching the code
    if (!waiting) return;

    const id = authClient.ensureElectronRedirect();
    return () => clearInterval(id);
  }, [waiting]);

  const handleCopy = async () => {
    if (!code) return;
    const success = await copy(code);

    if (success)
      toast.success(t("copy.success.title"), {
        description: t("copy.success.description"),
      });
    else
      toast.success(t("copy.error.title"), {
        description: t("copy.error.description"),
      });
  };

  if (code)
    return (
      <div className="max-w-75 flex flex-col items-center">
        <div className="flex size-14 items-center justify-center rounded-xl border border-lime-500/30 bg-lime-500/10 text-lime-600 dark:text-lime-500">
          <CheckIcon className="size-6" />
        </div>
        <h1 className="mt-8 text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          {t("description")}
        </p>
        <Button onClick={handleCopy} className="mt-8">
          <CopyIcon />
          {t("copy.button")}
        </Button>
      </div>
    );

  if (waiting) return <Loader size={1.75} />;

  return (
    <div className="flex max-w-80 flex-col items-center">
      <h1 className="text-3xl font-bold">{t("failed.title")}</h1>
      <p className="text-muted-foreground mt-2 text-center">
        <Trans
          i18nKey="auth:success.failed.description"
          components={[
            <a
              key={0}
              className="text-primary"
              href="mailto:support@blinkdisk.com"
            />,
          ]}
        />
      </p>
      <Button
        render={<Link to="/auth/login" search={search} />}
        nativeButton={false}
        className="mt-6"
      >
        {t("failed.button")}
      </Button>
    </div>
  );
}
