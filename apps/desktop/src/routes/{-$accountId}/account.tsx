import { LANGUAGE_CODES, LANGUAGE_NAMES } from "@blinkdisk/constants/language";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { useUpdateAccountForm } from "@desktop/hooks/forms/use-update-account-form";
import { useUpdatePreferencesForm } from "@desktop/hooks/forms/use-update-preferences-form";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useStore } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import {
  BellIcon,
  CloudIcon,
  KeyRoundIcon,
  LogInIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/{-$accountId}/account")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("settings.accountPage");
  const { isOnlineAccount } = useAccountId();

  return (
    <div className="flex min-h-full flex-col overflow-y-auto p-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("description")}
          </p>
        </div>

        {isOnlineAccount ? <AccountSettingsSection /> : <LocalAccountSection />}
        <PreferencesSettingsSection />
      </div>
    </div>
  );
}

function AccountSettingsSection() {
  const { t } = useAppTranslation("settings.account");
  const form = useUpdateAccountForm();
  const isDirty = useStore(form.store, () => form.state.isDirty);

  return (
    <SettingsSection title={t("title")} description={t("description")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
        className="flex flex-col gap-6"
      >
        <div className="flex gap-4">
          <form.AppField name="firstName">
            {(field) => (
              <field.Text
                label={{ title: t("auth:register.firstName.label") }}
                placeholder={t("auth:register.firstName.placeholder")}
              />
            )}
          </form.AppField>
          <form.AppField name="lastName">
            {(field) => (
              <field.Text
                label={{ title: t("auth:register.lastName.label") }}
                placeholder={t("auth:register.lastName.placeholder")}
              />
            )}
          </form.AppField>
        </div>
        <form.AppField name="email">
          {(field) => (
            <field.Text
              readOnly
              disabled
              label={{ title: t("auth:register.email.label") }}
              placeholder={t("auth:register.email.placeholder")}
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.Submit disabled={!isDirty}>{t("submit")}</form.Submit>
        </form.AppForm>
      </form>
    </SettingsSection>
  );
}

function PreferencesSettingsSection() {
  const { t } = useAppTranslation("settings.preferences");
  const form = useUpdatePreferencesForm();

  return (
    <SettingsSection title={t("title")} description={t("description")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
        className="flex flex-col gap-6"
      >
        <form.AppField name="theme">
          {(field) => (
            <field.Select
              label={{ title: t("theme.label") }}
              placeholder={t("theme.description")}
              items={[
                {
                  value: "light",
                  label: (
                    <div className="flex items-center gap-2">
                      <SunIcon className="size-4" /> {t("theme.items.light")}
                    </div>
                  ),
                },
                {
                  value: "dark",
                  label: (
                    <div className="flex items-center gap-2">
                      <MoonIcon className="size-4" />
                      {t("theme.items.dark")}
                    </div>
                  ),
                },
                {
                  value: "system",
                  label: (
                    <div className="flex items-center gap-2">
                      <MonitorIcon className="size-4" />
                      {t("theme.items.system")}
                    </div>
                  ),
                },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="language">
          {(field) => (
            <field.Select
              label={{ title: t("language.label") }}
              placeholder={t("language.description")}
              items={LANGUAGE_CODES.map((code) => ({
                value: code,
                label: LANGUAGE_NAMES[code].name,
              }))}
            />
          )}
        </form.AppField>
      </form>
    </SettingsSection>
  );
}

function LocalAccountSection() {
  const { t } = useAppTranslation("settings.accountPage.local");
  const { openAuthDialog } = useAuthDialog();

  return (
    <SettingsSection title={t("title")} description={t("description")}>
      <div className="grid gap-4">
        <SignInPoint
          icon={<CloudIcon />}
          title={t("auth:welcome.skipDialog.points.cloudblink.title")}
          description={t(
            "auth:welcome.skipDialog.points.cloudblink.description",
          )}
        />
        <SignInPoint
          icon={<KeyRoundIcon />}
          title={t("auth:welcome.skipDialog.points.sync.title")}
          description={t("auth:welcome.skipDialog.points.sync.description")}
        />
        <SignInPoint
          icon={<BellIcon />}
          title={t("auth:welcome.skipDialog.points.notifications.title")}
          description={t(
            "auth:welcome.skipDialog.points.notifications.description",
          )}
        />
      </div>

      <Button onClick={openAuthDialog} size="lg" className="mt-6 w-fit px-6">
        <LogInIcon />
        {t("button")}
      </Button>
    </SettingsSection>
  );
}

type SettingsSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="border-border bg-card rounded-xl border p-6">
      <div className="mb-6">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      {children}
    </section>
  );
}

type SignInPointProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function SignInPoint({ icon, title, description }: SignInPointProps) {
  return (
    <div className="flex gap-3">
      <div className="text-primary mt-0.5 [&>svg]:size-4">{icon}</div>
      <div className="grid gap-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs leading-5">{description}</p>
      </div>
    </div>
  );
}
