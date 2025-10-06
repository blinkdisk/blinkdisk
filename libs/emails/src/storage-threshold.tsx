import { Layout } from "@emails/components/layout";

import {
  LocaleProps,
  useEmailTranslation,
} from "@emails/hooks/use-email-translation";
import { Heading, Text } from "@react-email/components";

type StorageThresholdEmailProps = LocaleProps & {
  percentage: number;
};

export const StorageThresholdEmail = ({
  percentage,
  ...props
}: StorageThresholdEmailProps) => {
  const { t } = useEmailTranslation(props, "storageThreshold");

  return (
    <Layout preview={t("preview", { percentage })}>
      <Heading className="pt-4 text-2xl font-semibold text-gray-700">
        {t("title")}
      </Heading>
      <Text className="mb-4 text-sm text-gray-700">
        {t("body", { percentage })}
      </Text>
      <div
        style={{
          border: "1px solid #fef08a",
        }}
        className="rounded-md bg-yellow-50 px-4 py-1"
      >
        <Text className="text-sm font-medium text-yellow-800">
          {t("warning", { percentage })}
        </Text>
      </div>
    </Layout>
  );
};

StorageThresholdEmail.PreviewProps = {
  percentage: 80,
} as StorageThresholdEmailProps;

export default StorageThresholdEmail;
