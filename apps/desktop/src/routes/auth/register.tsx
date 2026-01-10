import { useRegisterForm } from "@desktop/hooks/forms/use-register-form";
import { useAuth } from "@desktop/hooks/use-auth";
import { useAppTranslation } from "@hooks/use-app-translation";
import { createFileRoute, Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { Trans } from "react-i18next";
import { z } from "zod";

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
  validateSearch: z.object({
    email: z.string().optional(),
  }),
});

function RouteComponent() {
  const { t } = useAppTranslation("auth.register");
  const { authenticated } = useAuth();
  
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const search = Route.useSearch();

  const form = useRegisterForm({
    defaultValues: {
      email: search.email,
    },
  });

  return (
    <div className="flex flex-col gap-y-8">
      {authenticated && canGoBack && (
        <Button
          variant="outline"
          size="sm"
          className="fixed right-10 top-10"
          onClick={() => router.history.back()}
        >
          <ArrowLeftIcon />
          Go back
        </Button>
      )}
      <div className="flex flex-col gap-y-3 text-center">
        <h1 className="text-4xl font-extrabold">{t("title")}</h1>
        <div className="text-muted-foreground text-center text-sm">
          <Trans
            i18nKey="auth:register.loginText"
            components={[
              <Link key={0} to="/auth/login" className="link-primary" />,
            ]}
          />
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
        className="flex w-[18rem] flex-col gap-4"
      >
        <div className="flex gap-2">
          <form.AppField name="firstName">
            {(field) => (
              <field.Text
                label={{ title: t("firstName.label") }}
                placeholder={t("firstName.placeholder")}
              />
            )}
          </form.AppField>
          <form.AppField name="lastName">
            {(field) => (
              <field.Text
                label={{ title: t("lastName.label") }}
                placeholder={t("lastName.placeholder")}
              />
            )}
          </form.AppField>
        </div>
        <form.AppField name="email">
          {(field) => (
            <field.Text
              label={{ title: t("email.label") }}
              placeholder={t("email.placeholder")}
            />
          )}
        </form.AppField>
        <form.AppField name="terms">
          {(field) => (
            <field.Checkbox
              label={{
                title: (
                  <Trans
                    i18nKey="auth:register.terms.label"
                    components={[
                      <a
                        key={0}
                        href={`${process.env.LANDING_URL}/terms`}
                        target="_blank"
                        className="link-primary"
                        rel="noreferrer"
                      />,
                      <a
                        key={1}
                        href={`${process.env.LANDING_URL}/privacy`}
                        target="_blank"
                        className="link-primary"
                        rel="noreferrer"
                      />,
                    ]}
                  />
                ),
                labelClassName: "text-xs font-normal",
              }}
              className="mt-0.5"
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.Submit className="mt-2">{t("submit")}</form.Submit>
        </form.AppForm>
      </form>
    </div>
  );
}
