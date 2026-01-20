import { Layout } from "@emails/components/layout";

import {
  LocaleProps,
  useEmailTranslation,
} from "@emails/hooks/use-email-translation";
import { Heading, Text } from "@react-email/components";

type StorageFullEmailProps = LocaleProps;

const StorageFullEmail = ({ ...props }: StorageFullEmailProps) => {
  const { t } = useEmailTranslation(props, "storageFull");

  return (
    <Layout preview={t("preview")}>
      <Heading className="pt-4 text-2xl font-semibold text-gray-700">
        {t("title")}
      </Heading>
      <Text className="mb-4 text-sm text-gray-700">{t("body")}</Text>
      <div
        style={{
          border: "1px solid #fecaca",
        }}
        className="rounded-md bg-red-50 px-4 py-1"
      >
        <Text className="text-sm font-medium text-red-800">{t("urgent")}</Text>
      </div>
      <Text className="mt-4 text-sm text-gray-700">{t("action")}</Text>
    </Layout>
  );
};

export default StorageFullEmail;
