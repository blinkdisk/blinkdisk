import { Layout } from "@emails/components/layout";

import {
  LocaleProps,
  useEmailTranslation,
} from "@emails/hooks/use-email-translation";
import { Heading, Text } from "@react-email/components";

type MagicEmailProps = LocaleProps & {
  code?: string[];
};

export const MagicEmail = ({ code, ...props }: MagicEmailProps) => {
  const { t } = useEmailTranslation(props, "magic");

  return (
    <Layout preview={t("preview")}>
      <Heading className="pt-4 text-2xl font-semibold text-gray-700">
        {t("title")}
      </Heading>
      <Text className="mb-8 text-sm text-gray-700">{t("body")}</Text>
      <code className="rounded-md bg-gray-200 px-2 py-1 font-mono text-2xl font-bold text-gray-800">
        {code?.join(" ")}
      </code>
      <Text className="mt-8 text-sm text-gray-700">{t("expiration")}</Text>
    </Layout>
  );
};

MagicEmail.PreviewProps = {
  code: ["21GNV", "JS38H"],
} as MagicEmailProps;

export default MagicEmail;
