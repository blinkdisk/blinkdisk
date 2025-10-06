import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { Trans } from "react-i18next";

export function DefaultErrorPage() {
  const { t } = useAppTranslation("error.pages.default");

  return (
    <div className="flex min-h-screen w-screen flex-col items-center">
      <div className="my-auto flex w-[21rem] flex-col text-center">
        <h1 className="text-5xl font-extrabold tracking-tight">{t("title")}</h1>
        <p className="mt-4 text-sm">
          <Trans
            i18nKey="error:pages.default.description"
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
