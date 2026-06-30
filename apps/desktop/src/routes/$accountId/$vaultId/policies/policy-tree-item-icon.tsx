import { isFileLikeSource } from "@blinkdisk/schemas/source";
import type { PolicyTreeNode } from "@desktop/lib/policy-target";
import {
  FileIcon,
  FolderIcon,
  MonitorIcon,
  UserIcon,
  VaultIcon,
} from "lucide-react";

export function PolicyTreeItemIcon({ node }: { node: PolicyTreeNode }) {
  if (node.target.kind === "SOURCE" || node.target.kind === "DRAFT_SOURCE") {
    return isFileLikeSource(node.source?.type) ? (
      <FileIcon className="size-4 shrink-0" />
    ) : (
      <FolderIcon className="size-4 shrink-0" />
    );
  }

  switch (node.target.kind) {
    case "GLOBAL":
      return <VaultIcon className="size-4 shrink-0" />;
    case "HOST":
      return <MonitorIcon className="size-4 shrink-0" />;
    case "USER":
      return <UserIcon className="size-4 shrink-0" />;
  }
}
