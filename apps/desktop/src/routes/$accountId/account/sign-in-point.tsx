import type { ReactNode } from "react";

type SignInPointProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export function SignInPoint({ icon, title, description }: SignInPointProps) {
  return (
    <div className="flex gap-3">
      <div className="text-primary mt-0.5 [&>svg]:size-4">{icon}</div>
      <div className="grid min-w-0 flex-1 gap-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs leading-5">{description}</p>
      </div>
    </div>
  );
}
