import { DeduplicationAnimation } from "@landing/components/animations/deduplication";
import { EncryptionAnimation } from "@landing/components/animations/encryption";
import { SetupAnimation } from "@landing/components/animations/setup";
import { cn } from "@utils/class";
import { ReactNode } from "react";

export function Features() {
  return (
    <section
      id="features"
      className="w-content mx-auto flex flex-col items-center gap-20 py-16 sm:gap-16 sm:py-24"
    >
      <Feature
        category="Intuitive Design"
        title="Built for everyone"
        description="BlinkDisk is designed for everyone, no technical knowledge required. Just install, choose what to protect, and your first backup starts in minutes."
      >
        <SetupAnimation />
      </Feature>
      <Feature
        category="End-to-End Encryption"
        title="Military-grade security"
        description="Your files are encrypted with your encryption password before they ever leave your device, ensuring only you can access them. Not even BlinkDisk can see your data."
        flip
      >
        <EncryptionAnimation />
      </Feature>
      <Feature
        category="File Deduplication"
        title="Efficient by design"
        description="BlinkDisk automatically detects and stores identical files only once. This saves valuable space, reduces upload times, and makes every backup feel effortlessly fast."
      >
        <DeduplicationAnimation />
      </Feature>
    </section>
  );
}

interface FeatureProps {
  category?: string;
  title: string;
  description: string;
  children?: ReactNode;
  flip?: boolean;
}

function Feature({
  category,
  title,
  description,
  children,
  flip,
}: FeatureProps) {
  return (
    <div
      className={cn(
        "w-content flex max-w-5xl flex-col items-center justify-between",
        flip ? "md:!flex-row-reverse" : "md:flex-row",
      )}
    >
      <div
        className={cn(
          "mb-8 flex w-full flex-col items-start justify-between xl:mb-0",
          flip ? "md:ml-20 xl:ml-32" : "md:mr-20 xl:mr-32",
        )}
      >
        <h2
          className={cn(
            "text-primary text-xs font-semibold uppercase tracking-widest sm:text-sm sm:tracking-[0.2rem]",
          )}
        >
          {category}
        </h2>
        <p className="text-foreground mt-4 text-left text-[2rem] font-bold leading-[1.125] md:text-[2.7rem]">
          {title}
        </p>
        <p className="text-muted-foreground mt-4 w-full text-sm sm:text-base md:mt-6">
          {description}
        </p>
      </div>
      <div
        className={cn(
          "bg-card w-content flex aspect-[15/10] max-w-[25rem] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border sm:aspect-[18/10]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
