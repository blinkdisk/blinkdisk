import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { SubscriptionPlans } from "@desktop/components/subscriptions/plans";

export function PlansSection() {
  const { t } = useAppTranslation("cloudblink.page.plans");
  const { t: subscriptionT } = useAppTranslation("subscription.upgradeDialog");

  return (
    <section>
      <SubscriptionPlans
        header={
          <div>
            <h2 className="text-xl font-semibold">{t("title")}</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              {subscriptionT("description")}
            </p>
          </div>
        }
        plansClassName="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2"
        cardClassName="w-full"
      />
    </section>
  );
}
