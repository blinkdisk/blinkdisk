import { cn } from "@blinkdisk/utils/class";
import type { ReactNode } from "react";

const enter =
  "animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500 ease-out motion-reduce:animate-none";

const delays = ["delay-0", "delay-100", "delay-200", "delay-300"] as const;

type OnboardingHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  size?: "default" | "lg";
};

export function OnboardingHeading({
  eyebrow,
  title,
  description,
  size = "default",
}: OnboardingHeadingProps) {
  return (
    <div className={enter}>
      {eyebrow ? (
        <p className="text-primary mb-4 text-sm font-semibold">{eyebrow}</p>
      ) : null}
      <h1
        className={cn(
          "text-balance font-bold tracking-tight",
          size === "lg" ? "text-5xl leading-[1.08]" : "text-3xl leading-tight",
        )}
      >
        {title}
      </h1>
      {description ? (
        <p
          className={cn(
            "text-muted-foreground max-w-md text-pretty leading-relaxed",
            size === "lg" ? "mt-5 text-lg" : "mt-3",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

type OnboardingSectionProps = {
  order?: 1 | 2 | 3;
  className?: string;
  children: ReactNode;
};

export function OnboardingSection({
  order = 1,
  className,
  children,
}: OnboardingSectionProps) {
  return <div className={cn(enter, delays[order], className)}>{children}</div>;
}
