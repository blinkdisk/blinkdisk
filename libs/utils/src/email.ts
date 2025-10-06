import CleanupEmail from "@emails/cleanup";
import MagicEmail from "@emails/magic";
import StorageFullEmail from "@emails/storage-full";
import StorageThresholdEmail from "@emails/storage-threshold";
import { locales } from "@utils/locales";
import { CreateEmailOptions, Resend } from "resend";

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

const resend = new Resend(
  process.env.RESEND_API_KEY || "re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
);

type EmailAccount = {
  email: string;
  language: string | undefined | null;
};

export async function sendEmail(...args: Parameters<typeof getEmailOptions>) {
  const options = getEmailOptions(...args);
  await resend.emails.send(options);
}

export async function sendBatchEmails(options: CreateEmailOptions[]) {
  await resend.batch.send(options);
}

export function getEmailOptions<Key extends keyof typeof templates>(
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

  return {
    from: `BlinkDisk <${templates[template].sender}@${process.env.RESEND_DOMAIN}>`,
    to: account.email,
    subject,
    react: templates[template].component({
      ...((props || {}) as any),
      locale: account.language || "en",
      locales,
    }),
  };
}
