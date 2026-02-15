import { FREE_SPACE_AVAILABLE } from "@config/space";
import { CloudBlinkIcon } from "@desktop/components/icons/cloudblink";
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
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CloudBlinkIcon className="h-4 w-auto" />
          <Button
            as="a"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            href={`${process.env.MARKETING_URL}/cloudblink?ref=desktop`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLinkIcon />
            {t("cloudblink.readMore")}
          </Button>
        </CardHeader>
        <CardContent className="pb-6">
          <p className="text-muted-foreground text-sm">
            <CheckIcon className="mr-2 inline-block size-4" />
            {t("cloudblink.features.freeStorage", {
              freeSpace: formatSize(FREE_SPACE_AVAILABLE),
            })}
          </p>
          <p className="text-muted-foreground text-sm">
            <CheckIcon className="mr-2 inline-block size-4" />
            {t("cloudblink.features.noSetup")}
          </p>
          <p className="text-muted-foreground text-sm">
            <CheckIcon className="mr-2 inline-block size-4" />
            {t("cloudblink.features.cheaper")}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={selectCloud}>
            {t("cloudblink.button")}
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
