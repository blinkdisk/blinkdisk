import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { Loader } from "#loader";
import { cn } from "@utils/class";

const buttonVariants = cva(
  "relative focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline:
          "border hover:bg-card hover:text-foreground border-foreground/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-input",
        ghost: "hover:bg-foreground/5",
        destructive:
          "bg-destructive hover:bg-destructive/00 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive-foreground focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        "destructive-secondary":
          "bg-destructive/10 text-destructive hover:bg-destructive/15 border border-destructive/20 focus-visible:ring-destructive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4",
        lg: "h-11.5 text-sm px-8",
        xl: "h-13 text-base px-8",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-xs": "size-6",
        "icon-lg": "size-11.5",
        "icon-xl": "size-13 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    as?: "a" | "button";
    innerClassName?: string;
    loading?: boolean;
  };

function Button({
  as,
  className,
  variant = "default",
  size = "default",
  children,
  loading,
  innerClassName,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && (
        <Loader className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      )}
      <span
        className={cn(
          "inline-flex items-center gap-2",
          innerClassName,
          loading && "invisible",
        )}
      >
        {children}
      </span>
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
