import { Layout } from "@emails/components/layout";

import {
  type LocaleProps,
  useEmailTranslation,
} from "@emails/hooks/use-email-translation";
import { Heading, Text } from "@react-email/components";

type CancellationWarningEmailProps = LocaleProps & {
  daysLeft: number;
};

const CancellationWarningEmail = ({
  daysLeft,
  ...props
}: CancellationWarningEmailProps) => {
  const { t } = useEmailTranslation(props, "cancellationWarning");

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

CancellationWarningEmail.PreviewProps = {
  daysLeft: 3,
} as CancellationWarningEmailProps;

export default CancellationWarningEmail;
