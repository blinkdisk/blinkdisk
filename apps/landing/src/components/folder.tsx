import { EmojiCard } from "@ui/emoji-card";

type FolderProps = {
  folder: {
    emoji: string;
    name: string;
    files: number;
    size?: number;
  };
};

export function Folder({ folder }: FolderProps) {
  return (
    <div key={folder.name} className="flex items-center gap-3">
      <EmojiCard emoji={folder.emoji} size="sm" />
      <div className="flex flex-col">
        <p className="text-base font-semibold">{folder.name}</p>
        <p className="text-muted-foreground text-xs">
          {folder.files.toLocaleString()} Files{" "}
          {folder.size ? <>⸱ {folder.size.toLocaleString()} GB</> : null}
        </p>
      </div>
    </div>
  );
}
