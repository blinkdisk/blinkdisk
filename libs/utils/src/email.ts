import CancellationWarningEmail from "@blinkdisk/emails/cancellation-warning";
import MagicEmail from "@blinkdisk/emails/magic";
import StorageFullEmail from "@blinkdisk/emails/storage-full";
import StorageThresholdEmail from "@blinkdisk/emails/storage-threshold";
import TrialWarningEmail from "@blinkdisk/emails/trial-warning";
import Plunk from "@plunk/node";
import { pretty, render } from "@react-email/render";
import { locales } from "@utils/locales";
import nodemailer from "nodemailer";

const templates = {
  magic: {
    sender: "auth",
    component: MagicEmail,
  },
  storageThreshold: {
    sender: "cloudblink",
    component: StorageThresholdEmail,
  },
  storageFull: {
    sender: "cloudblink",
    component: StorageFullEmail,
  },
  cancellationWarning: {
    sender: "cloudblink",
    component: CancellationWarningEmail,
  },
  trialWarning: {
    sender: "cloudblink",
    component: TrialWarningEmail,
  },
};

type TemplateProps<Key extends keyof typeof templates> = Parameters<
  (typeof templates)[Key]["component"]
>[0];

type TemplateComponent<Key extends keyof typeof templates> = (
  props: TemplateProps<Key>,
) => ReturnType<(typeof templates)[Key]["component"]>;

type EmailAccount = {
  email: string;
  language: string | undefined | null;
};

export async function sendEmail(...args: Parameters<typeof getEmailOptions>) {
  const options = await getEmailOptions(...args);

  if (process.env.EMAIL_PROVIDER === "plunk") {
    const plunk = new Plunk(process.env.PLUNK_SECRET_KEY || "", {
      ...(process.env.PLUNK_URL && { baseUrl: process.env.PLUNK_URL }),
    });

    await plunk.emails.send({
      from: options.email,
      name: options.name,
      to: options.to,
      subject: options.subject,
      body: options.html,
      type: "html",
      subscribed: true,
    });
  } else {
    const smtp = nodemailer.createTransport(process.env.SMTP_URL || "");

    await smtp.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}

export async function getEmailOptions<Key extends keyof typeof templates>(
  template: Key,
  account: EmailAccount,
  props?: Omit<TemplateProps<Key>, "locale" | "locales">,
) {
  const locale = (locales[account.language ?? "en"] ??
    locales.en) as (typeof locales)["en"];
  let subject = locale.email[template]?.subject ?? "";

  Object.entries(props || {}).forEach(([key, value]) => {
    if (typeof value === "object") return;
    subject = subject.replace(`{{${key}}}`, String(value));
  });

  const component = templates[template]
    .component as unknown as TemplateComponent<Key>;

  const html = await pretty(
    await render(
      component({
        ...(props || {}),
        locale: account.language || "en",
        locales,
      } as TemplateProps<Key>),
    ),
  );

  const name = "BlinkDisk";
  const email = `${templates[template].sender}@${process.env.EMAIL_DOMAIN}`;
  const from = `${name} <${email}>`;

  return {
    name,
    email,
    from,
    to: account.email,
    subject,
    html,
  };
}
