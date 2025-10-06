import { plans } from "@config/plans";
import { useChangePlanForm } from "@desktop/hooks/forms/use-change-plan-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription } from "@ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui/dialog";
import { useMemo } from "react";
import { Trans } from "react-i18next";

export type PlanChangeAction = "UPGRADE" | "DOWNGRADE" | "PERIOD_CHANGE";

type PlanChangeDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  priceId?: string;
  action?: PlanChangeAction;
};

export function PlanChangeDialog({
  isOpen,
  setIsOpen,
  priceId,
  action,
}: PlanChangeDialogProps) {
  const { t } = useAppTranslation(`subscription.subscriptionChangeDialog`);

  const form = useChangePlanForm({ priceId });

  const plan = useMemo(() => {
    if (!priceId) return null;
    return plans.find((plan) =>
      plan.prices.find((price) => price.id === priceId),
    );
  }, [priceId]);

  const price = useMemo(() => {
    if (!plan) return null;
    return plan.prices.find((price) => price.id === priceId);
  }, [plan, priceId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-100 block max-h-[80v]">
        <DialogTitle>{t(`${action}.title`)}</DialogTitle>
        <DialogDescription className="mt-3">
          {t(`${action}.description`)}
        </DialogDescription>

        <div className="my-5 flex w-full items-center justify-between">
          <p className="text-xl font-bold">
            {plan?.storageGB.toLocaleString()} GB
          </p>
          <p className="text-xl font-bold">
            <Trans
              i18nKey={`subscription:subscriptionChangeDialog.${price?.period?.toLowerCase()}`}
              components={[
                <span
                  key={1}
                  className="text-muted-foreground text-base font-normal"
                />,
              ]}
              values={{
                amount:
                  price?.amount?.toLocaleString(undefined, {
                    style: "currency",
                    minimumFractionDigits: 0,
                    currency: price?.currency,
                  }) || "",
              }}
            />
          </p>
        </div>
        <Alert variant="info" className="mt-4">
          <AlertDescription>{t(`${action}.info`)}</AlertDescription>
        </Alert>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
          className="mt-6 flex w-full flex-col gap-6"
        >
          <form.AppField name="confirmed">
            {(field) => (
              <field.Checkbox
                label={{
                  title: t("confirmation"),
                  labelClassName: "text-sm font-normal",
                }}
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.Submit>{t(`${action}.submit`)}</form.Submit>
          </form.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
}
