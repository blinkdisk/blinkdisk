import { Layout } from "@emails/components/layout";

import {
  LocaleProps,
  useEmailTranslation,
} from "@emails/hooks/use-email-translation";
import { Heading, Text } from "@react-email/components";

type CleanupEmailProps = LocaleProps & {
  daysLeft: number;
};

export const CleanupEmail = ({ daysLeft, ...props }: CleanupEmailProps) => {
  const { t } = useEmailTranslation(props, "cleanup");

  return (
    <Layout preview={t("preview", { daysLeft })}>
      <Heading className="pt-4 text-2xl font-semibold text-gray-700">
        {t("title", { daysLeft })}
      </Heading>
      <Text className="mb-4 text-sm text-gray-700">
        {t("body", { daysLeft })}
      </Text>
      <div
        style={{
          border: "1px solid #fecaca",
        }}
        className="rounded-md bg-red-50 px-4 py-1"
      >
        <Text className="text-sm font-medium text-red-800">
          {t("warning", { daysLeft })}
        </Text>
      </div>
    </Layout>
  );
};

CleanupEmail.PreviewProps = {
  daysLeft: 3,
} as CleanupEmailProps;

export default CleanupEmail;
