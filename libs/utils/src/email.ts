import CleanupEmail from "@emails/cleanup";
import MagicEmail from "@emails/magic";
import StorageFullEmail from "@emails/storage-full";
import StorageThresholdEmail from "@emails/storage-threshold";
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
    sender: "cloud",
    component: StorageThresholdEmail,
  },
  storageFull: {
    sender: "cloud",
    component: StorageFullEmail,
  },
  cleanup: {
    sender: "cloud",
    component: CleanupEmail,
  },
};

type EmailAccount = {
  email: string;
  language: string | undefined | null;
};

export async function sendEmail(...args: Parameters<typeof getEmailOptions>) {
  const options = await getEmailOptions(...args);

  if (process.env.EMAIL_PROVIDER === "plunk") {
    const plunk = new Plunk(process.env.PLUNK_SECRET_KEY!, {
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
    const smtp = nodemailer.createTransport(process.env.SMTP_URL!);

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
  props?: Omit<
    Parameters<(typeof templates)[Key]["component"]>[0],
    "locale" | "locales"
  >,
) {
  let subject = locales[account.language ?? "en"]?.email[template]?.subject;

  Object.entries(props || {}).forEach(([key, value]) => {
    if (typeof value === "object") return;
    subject = subject.replace(`{{${key}}}`, String(value));
  });

  const html = await pretty(
    await render(
      templates[template].component({
        ...((props || {}) as any),
        locale: account.language || "en",
        locales,
      }),
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
