import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { cn } from "@blinkdisk/utils/class";
import { useEmailVisibility } from "@desktop/hooks/use-email-visibility";

type EmailProps = {
  email: string;
  className?: string;
  hiddenVariant?: "hidden" | "blur";
};

export function Email({
  email,
  className,
  hiddenVariant = "hidden",
}: EmailProps) {
  const { t } = useAppTranslation("settings.emailVisibility");
  const { isEmailVisible } = useEmailVisibility();
  const shouldBlurEmail = !isEmailVisible && hiddenVariant === "blur";

  return (
    <span
      className={cn(
        "min-w-0",
        className,
        shouldBlurEmail && "!overflow-visible",
      )}
    >
      {isEmailVisible || shouldBlurEmail ? (
        <span
          aria-hidden={!isEmailVisible}
          className={cn(
            "block",
            isEmailVisible
              ? "truncate"
              : "select-none whitespace-nowrap blur-[3px]",
          )}
        >
          {isEmailVisible ? email : "support@blinkdisk.com"}
        </span>
      ) : null}
      {!isEmailVisible ? <span className="sr-only">{t("hidden")}</span> : null}
    </span>
  );
}
