import { Slot } from "@radix-ui/react-slot";
import { Link, LinkComponentProps } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { Loader } from "@ui/loader";
import { cn } from "@utils/class";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [.landing_&]:cursor-pointer [.desktop_&]:cursor-default",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",
        "destructive-secondary":
          "bg-destructive/10 text-destructive hover:bg-destructive/15 border border-destructive/20 focus-visible:ring-destructive",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        white: "bg-white text-primary hover:bg-white/90",
      },
      size: {
        default: "h-11 rounded-md px-5",
        sm: "h-9 px-4",
        lg: "h-11.5 rounded-md text-sm px-8",
        xl: "h-13 rounded-md text-base px-8",
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

type BaseProps = VariantProps<typeof buttonVariants> & {
  children: React.ReactNode;
  asChild?: boolean;
  loading?: boolean;
  innerClassName?: string;
  disabled?: boolean;
};

type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  BaseProps & {
    as?: undefined;
    onClick: () => void;
  };

type LinkProps = LinkComponentProps &
  BaseProps & {
    as?: "link";
  };

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  BaseProps & {
    as: "a";
  };

export type ButtonProps = HTMLButtonProps | LinkProps | AnchorProps;

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      as,
      className,
      innerClassName,
      variant,
      size,
      asChild = false,
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = (
      as === "a" ? "a" : as === "link" ? Link : asChild ? Slot : "button"
    ) as React.ElementType;
    const isAnchor = as === "link" || as === "a" || asChild;
    const elementRef = isAnchor
      ? (ref as React.Ref<HTMLAnchorElement>)
      : (ref as React.Ref<HTMLButtonElement>);

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          loading && "disabled:opacity-100",
          className,
        )}
        ref={elementRef}
        disabled={disabled || loading}
        {...(props as ButtonProps)}
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
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
