import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { Trans } from "react-i18next";

export function NotFoundPage() {
  const { t } = useAppTranslation("error.pages.not-found");

  return (
    <div className="flex min-h-screen w-screen flex-col items-center">
      <div className="my-auto flex w-[18rem] flex-col text-center">
        <h1 className="text-6xl font-extrabold tracking-tight">{t("title")}</h1>
        <p className="mt-4 text-sm">
          <Trans
            i18nKey="error:pages.not-found.description"
            components={[
              <a
                key={0}
                href="mailto:support@blinkdisk.com"
                className="link-primary"
              />,
            ]}
          />
        </p>
        <div>
          <Button as="link" to="/" className="mt-8">
            {t("button")}
          </Button>
        </div>
      </div>
    </div>
  );
}
