import { FREE_SPACE_AVAILABLE } from "@config/space";
import { Logo } from "@desktop/components/logo";
import { formatSize } from "@desktop/lib/number";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/card";
import { CheckIcon, XIcon } from "lucide-react";

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
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge variant="muted" className="px-2 py-0.5 text-sm">
              Cloud
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-5">
          <p className="text-muted-foreground text-sm">
            <CheckIcon className="mr-2 inline-block size-4" />
            {t("blinkdiskCloud.features.freeStorage", {
              freeSpace: formatSize(FREE_SPACE_AVAILABLE),
            })}
          </p>
          <p className="text-muted-foreground text-sm">
            <CheckIcon className="mr-2 inline-block size-4" />
            {t("blinkdiskCloud.features.noSetup")}
          </p>
          <p className="text-muted-foreground text-sm">
            <CheckIcon className="mr-2 inline-block size-4" />
            {t("blinkdiskCloud.features.cheaper")}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={selectCloud}>
            {t("blinkdiskCloud.button")}
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
