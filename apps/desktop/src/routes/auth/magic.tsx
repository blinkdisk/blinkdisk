import { useMagicCodeForm } from "@desktop/hooks/forms/use-magic-code-form";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { Slot } from "@ui/input-otp";
import { AlertTriangleIcon } from "lucide-react";
import { Trans } from "react-i18next";

export const Route = createFileRoute("/auth/magic")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("auth.magic");

  const form = useMagicCodeForm();
  const errors = useStore(form.store, (state) => state.errorMap);

  return (
    <div className="flex max-w-[21rem] flex-col gap-y-8">
      <div className="flex flex-col gap-y-3 text-center">
        <h1 className="text-4xl font-extrabold">{t("title")}</h1>
        <div className="text-muted-foreground text-center text-sm">
          <Trans
            i18nKey="auth:magic.description"
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
        className="flex flex-col gap-6"
      >
        <form.AppField name="code">
          {(field) => (
            <field.Code
              maxLength={10}
              render={({ slots }) => (
                <div className="flex w-full items-center justify-between">
                  <div className="flex">
                    {slots.slice(0, 5).map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </div>
                  <div className="flex">
                    {slots.slice(5).map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </div>
                </div>
              )}
            />
          )}
        </form.AppField>
        {errors.onSubmit &&
        errors.onSubmit.code &&
        (errors.onSubmit.code as unknown as string) === "INVALID_CODE" ? (
          <Alert variant="destructive">
            <AlertTriangleIcon className="mb-0.5 mr-2 inline-block size-3.5" />
            <AlertTitle>{t("invalid.title")}</AlertTitle>
            <AlertDescription className="text-xs">
              {t("invalid.description")}
            </AlertDescription>
          </Alert>
        ) : null}
        <form.AppForm>
          <form.Submit>{t("submit")}</form.Submit>
        </form.AppForm>
      </form>
    </div>
  );
}
