import { FREE_SPACE_AVAILABLE } from "@config/space";
import { BlinkCloudIcon } from "@desktop/components/icons/blinkcloud";
import { formatSize } from "@desktop/lib/number";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/card";
import { CheckIcon, ExternalLinkIcon, XIcon } from "lucide-react";

export type CreateVaultVariantProps = {
  selectCloud: () => void;
  selectCustom: () => void;
};

export function CreateVaultVariant({
  selectCloud,
  selectCustom,
}: CreateVaultVariantProps) {
  const { t } = useAppTranslation("vault.createDialog.variant");

  return (
    <div className="mt-8 flex flex-col gap-5">
      <Card>
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <BlinkCloudIcon className="h-4 my-2 w-auto" />
          <Button
            as="a"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            href={`${process.env.MARKETING_URL}/blinkcloud?ref=desktop`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLinkIcon />
            {t("blinkcloud.readMore")}
          </Button>
        </CardHeader>
        <CardContent className="pb-5">
          <p className="text-muted-foreground text-sm">
            <CheckIcon className="mr-2 inline-block size-4" />
            {t("blinkcloud.features.freeStorage", {
              freeSpace: formatSize(FREE_SPACE_AVAILABLE),
            })}
          </p>
          <p className="text-muted-foreground text-sm">
            <CheckIcon className="mr-2 inline-block size-4" />
            {t("blinkcloud.features.noSetup")}
          </p>
          <p className="text-muted-foreground text-sm">
            <CheckIcon className="mr-2 inline-block size-4" />
            {t("blinkcloud.features.cheaper")}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={selectCloud}>
            {t("blinkcloud.button")}
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("custom.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            <XIcon className="mr-2 inline-block size-4" />
            {t("custom.features.noFreeStorage")}
          </p>
          <p className="text-muted-foreground text-sm">
            <XIcon className="mr-2 inline-block size-4" />
            {t("custom.features.manualSetup")}
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={selectCustom}>
            {t("custom.button")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
