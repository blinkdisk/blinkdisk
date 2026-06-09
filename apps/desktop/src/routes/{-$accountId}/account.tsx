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
    <div className="flex min-h-full flex-col overflow-y-auto px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">
            {t("title")}
          </h1>
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
    >
      <SettingsPanel>
        <SettingsRow title={t("settings:accountPage.profile.fullName")}>
          <div className="grid w-full gap-3 md:w-64 md:grid-cols-2">
            <form.AppField name="firstName">
              {(field) => (
                <field.Text
                  label={{
                    title: t("auth:register.firstName.label"),
                    labelClassName: "sr-only",
                  }}
                  placeholder={t("auth:register.firstName.placeholder")}
                />
              )}
            </form.AppField>
            <form.AppField name="lastName">
              {(field) => (
                <field.Text
                  label={{
                    title: t("auth:register.lastName.label"),
                    labelClassName: "sr-only",
                  }}
                  placeholder={t("auth:register.lastName.placeholder")}
                />
              )}
            </form.AppField>
          </div>
        </SettingsRow>
        <SettingsRow title={t("auth:register.email.label")}>
          <form.AppField name="email">
            {(field) => (
              <field.Text
                readOnly
                disabled
                label={{
                  title: t("auth:register.email.label"),
                  labelClassName: "sr-only",
                }}
                placeholder={t("auth:register.email.placeholder")}
                className="md:w-64"
              />
            )}
          </form.AppField>
        </SettingsRow>
        <SettingsRow>
          <form.AppForm>
            <form.Submit disabled={!isDirty}>{t("submit")}</form.Submit>
          </form.AppForm>
        </SettingsRow>
      </SettingsPanel>
    </form>
  );
}

function PreferencesSettingsSection() {
  const { t } = useAppTranslation("settings.preferences");
  const form = useUpdatePreferencesForm();

  return (
    <SettingsGroup title={t("title")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
      >
        <SettingsPanel>
          <SettingsRow
            title={t("theme.label")}
            description={t("theme.description")}
          >
            <form.AppField name="theme">
              {(field) => (
                <field.Select
                  label={{
                    title: t("theme.label"),
                    labelClassName: "sr-only",
                  }}
                  placeholder={t("theme.description")}
                  triggerClassName="md:w-64"
                  items={[
                    {
                      value: "light",
                      label: (
                        <div className="flex items-center gap-2">
                          <SunIcon className="size-4" />{" "}
                          {t("theme.items.light")}
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
          </SettingsRow>
          <SettingsRow
            title={t("language.label")}
            description={t("language.description")}
          >
            <form.AppField name="language">
              {(field) => (
                <field.Select
                  label={{
                    title: t("language.label"),
                    labelClassName: "sr-only",
                  }}
                  placeholder={t("language.description")}
                  triggerClassName="md:w-64"
                  items={LANGUAGE_CODES.map((code) => ({
                    value: code,
                    label: LANGUAGE_NAMES[code].name,
                  }))}
                />
              )}
            </form.AppField>
          </SettingsRow>
        </SettingsPanel>
      </form>
    </SettingsGroup>
  );
}

function LocalAccountSection() {
  const { t } = useAppTranslation("settings.accountPage.local");
  const { openAuthDialog } = useAuthDialog();

  return (
    <SettingsPanel>
      <SettingsRow title={t("title")} description={t("description")}>
        <Button onClick={openAuthDialog} size="lg" className="w-fit px-6">
          <LogInIcon />
          {t("button")}
        </Button>
      </SettingsRow>
      <SettingsRow>
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
      </SettingsRow>
    </SettingsPanel>
  );
}

type SettingsGroupProps = {
  title: string;
  children: ReactNode;
};

function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

type SettingsPanelProps = {
  children: ReactNode;
};

function SettingsPanel({ children }: SettingsPanelProps) {
  return (
    <section className="border-border bg-card overflow-hidden rounded-xl border">
      {children}
    </section>
  );
}

type SettingsRowProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

function SettingsRow({ title, description, children }: SettingsRowProps) {
  return (
    <div className="border-border flex flex-col gap-4 border-b px-5 py-4 last:border-b-0 md:min-h-20 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        {title ? <p className="text-base font-medium">{title}</p> : null}
        {description ? (
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex w-full justify-start md:w-auto md:justify-end">
        {children}
      </div>
    </div>
  );
}

type SignInPointProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function SignInPoint({ icon, title, description }: SignInPointProps) {
  return (
    <div className="flex max-w-xl gap-3">
      <div className="text-primary mt-0.5 [&>svg]:size-4">{icon}</div>
      <div className="grid gap-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs leading-5">{description}</p>
      </div>
    </div>
  );
}
