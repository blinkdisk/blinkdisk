import { useLoginForm } from "@desktop/hooks/forms/use-login-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trans } from "react-i18next";

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("auth.login");
  const form = useLoginForm();

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex flex-col gap-y-3 text-center">
        <h1 className="text-4xl font-extrabold">{t("title")}</h1>
        <div className="text-muted-foreground text-center text-sm">
          <Trans
            i18nKey="auth:login.registerText"
            components={[
              <Link key={0} to="/auth/register" className="link-primary" />,
            ]}
          />
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
        className="flex w-[18rem] flex-col gap-6"
      >
        <form.AppField name="email">
          {(field) => (
            <field.Text
              label={{ title: t("email.label") }}
              placeholder={t("email.placeholder")}
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.Submit>{t("submit")}</form.Submit>
        </form.AppForm>
      </form>
    </div>
  );
}
