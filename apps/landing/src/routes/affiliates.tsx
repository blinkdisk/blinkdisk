import { plans } from "@config/plans";
import { head } from "@landing/utils/head";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";
import {
  ArrowRightIcon,
  ClockIcon,
  CookieIcon,
  DollarSignIcon,
} from "lucide-react";

export const Route = createFileRoute("/affiliates")({
  component: RouteComponent,
  head: head({
    title: "Affiliate Program",
    description:
      "Join the BlinkDisk Affiliate Program in minutes and earn generous commissions for every customer you refer.",
  }),
});

const commission = 0.3;
const duration = 12;

function RouteComponent() {
  const mostExpensivePlan = plans
    .map((plan) =>
      plan.prices
        .filter((plan) => plan.period === "MONTHLY")
        .reduce((a, b) => {
          return a.amount > b.amount ? a : b;
        }),
    )
    .reduce((a, b) => {
      return a.amount > b.amount ? a : b;
    });

  return (
    <div className="py-page flex min-h-screen flex-col items-center">
      <div className="mt-auto"></div>
      <div className="w-content mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="flex flex-col items-center">
          <a
            href="https://affiliate.watch/?ref=blinkdisk"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="/images/affiliate-badge.svg"
              className="w-40 opacity-80 dark:invert"
            />
          </a>
          <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Earn up to{" "}
            {Math.floor(
              mostExpensivePlan.amount * 12 * commission,
            ).toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            })}{" "}
            <br className="hidden sm:block" />
            for each referral
          </h1>
          <p className="text-muted-foreground sm:w-lg mt-6 text-base sm:text-lg">
            Join the BlinkDisk Affiliate Program in minutes and earn generous
            commissions for every customer you refer.{" "}
          </p>
        </div>

        <Button
          as="a"
          href="https://blinkdisk.endorsely.com/"
          target="_blank"
          rel="noopener noreferrer"
          size="xl"
          className="mt-10"
        >
          Join Affiliate Program
          <ArrowRightIcon className="ml-2" />
        </Button>

        <div className="mt-16 grid w-full grid-cols-1 gap-6 sm:mt-20 md:grid-cols-3">
          <FeatureCard
            icon={<DollarSignIcon className="size-6" />}
            title={`${commission.toLocaleString(undefined, {
              style: "percent",
            })} Commission`}
            description={`Earn ${commission.toLocaleString(undefined, {
              style: "percent",
            })} commission on all referrals for 12 months`}
          />
          <FeatureCard
            icon={<ClockIcon className="size-6" />}
            title={`${duration} Month Duration`}
            description="Your commission continues for a full year on each referral"
          />
          <FeatureCard
            icon={<CookieIcon className="size-6" />}
            title="90 Day Cookie"
            description="90-day cookie tracking ensures you get credit for your referrals"
          />
        </div>
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card flex flex-col items-center rounded-xl border p-6 text-center">
      <div className="text-primary mb-4 [&_svg]:size-8">{icon}</div>
      <h3 className="text-foreground text-2xl font-bold">{title}</h3>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </div>
  );
}
