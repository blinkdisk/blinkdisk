import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { LinkIcon, PlusIcon } from "lucide-react";

export type AddVaultSourceProps = {
  create: () => void;
  link: () => void;
};

export function AddVaultSource({ create, link }: AddVaultSourceProps) {
  const { t } = useAppTranslation("vault.addDialog.folder");

  return (
    <div className="mt-8 flex gap-5">
      <SourceButton
        title={t("existing.title")}
        description={t("existing.description")}
        icon={<LinkIcon />}
        onClick={link}
      />
      <SourceButton
        title={t("new.title")}
        description={t("new.description")}
        icon={<PlusIcon />}
        onClick={create}
      />
    </div>
  );
}

type SourceButtonProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export function SourceButton({
  title,
  description,
  icon,
  onClick,
}: SourceButtonProps) {
  return (
    <Button
      className="h-auto w-1/2 flex-col rounded-xl py-6"
      innerClassName="flex flex-col gap-0"
      variant="outline"
      onClick={onClick}
    >
      <div className="text-muted-foreground [&>svg]:size-6">{icon}</div>
      <span className="mt-3 text-base">{title}</span>
      <p className="text-muted-foreground mt-1 text-wrap text-xs">
        {description}
      </p>
    </Button>
  );
}
