"use client";

import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps & { dark: boolean }) => {
  return (
    <Sonner
      className="toaster group"
      duration={5000}
      style={{ fontFamily: "inherit" }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!bg-card group-[.toaster]:!text-card-foreground group-[.toaster]:!border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:!text-muted-foreground text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-6 !pr-2 text-green-500" />,
        info: <InfoIcon className="text-primary-600 size-6 !pr-2" />,
        error: <CircleXIcon className="size-6 !pr-2 text-red-500" />,
        warning: <TriangleAlertIcon className="size-6 !pr-2 text-amber-600" />,
      }}
      theme={props.theme === "dark" ? "dark" : "light"}
      {...props}
    />
  );
};

export { Toaster };
