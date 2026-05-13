import { Layout } from "@emails/components/layout";

import {
  LocaleProps,
  useEmailTranslation,
} from "@emails/hooks/use-email-translation";
import { Heading, Text } from "@react-email/components";

type TrialWarningEmailProps = LocaleProps & {
  daysLeft: number;
};

const TrialWarningEmail = ({ daysLeft, ...props }: TrialWarningEmailProps) => {
  const { t } = useEmailTranslation(props, "trialWarning");

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
          border: "1px solid #fed7aa",
        }}
        className="rounded-md bg-orange-50 px-4 py-1"
      >
        <Text className="text-sm font-medium text-orange-800">
          {t("warning", { daysLeft })}
        </Text>
      </div>
    </Layout>
  );
};

TrialWarningEmail.PreviewProps = {
  daysLeft: 3,
} as TrialWarningEmailProps;

export default TrialWarningEmail;
