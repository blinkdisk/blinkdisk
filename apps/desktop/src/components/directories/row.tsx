import { Item } from "@desktop/components/directories/table";
import { useRestoreSingle } from "@desktop/hooks/mutations/core/use-restore-single";
import { useNavigate } from "@tanstack/react-router";
import { flexRender, Row } from "@tanstack/react-table";
import { VirtualItem } from "@tanstack/react-virtual";
import { TableCell, TableRow } from "@ui/table";
import { cn } from "@utils/class";

type DirectoryItemRowProps = {
  row: Row<Item> | undefined;
  virtualRow: VirtualItem;
  reset: () => void;
};

export function DirectoryItemRow({
  row,
  virtualRow,
  reset,
}: DirectoryItemRowProps) {
  const navigate = useNavigate();
  const { mutate: restore, isPending } = useRestoreSingle();

  if (!row) return null;
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      onClick={() => {
        if (row.original?.type === "DIRECTORY") {
          reset();

          navigate({
            to: "/app/{-$deviceId}/{-$profileId}/{-$vaultId}/{-$folderId}/{-$backupId}/{-$directoryId}",
            params: (params) => ({
              ...params,
              directoryId: row.original.objectId || "",
            }),
            search: (search) => ({
              ...search,
              path: [
                ...(search.path || []),
                { objectId: row.original?.objectId, name: row.original?.name },
              ],
            }),
          });
        } else restore(row.original);
      }}
      style={{
        transform: `translateY(${virtualRow.start}px)`,
        height: `${virtualRow.size}px`,
      }}
      className="absolute flex w-full cursor-default"
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          style={{
            width:
              cell.column.getSize() !== 0 ? cell.column.getSize() : undefined,
            flexGrow: cell.column.getSize() === 0 ? 1 : undefined,
            flexShrink: cell.column.getSize() === 0 ? 1 : 0,
          }}
          className={cn(
            "flex items-center overflow-hidden truncate",
            cell.column.id === "name" ? "ph-no-capture" : "",
          )}
        >
          {flexRender(cell.column.columnDef.cell, {
            ...cell.getContext(),
            isPending,
          })}
        </TableCell>
      ))}
    </TableRow>
  );
}
