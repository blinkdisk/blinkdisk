import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Checkbox } from "@blinkdisk/ui/checkbox";
import { Input } from "@blinkdisk/ui/input";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@blinkdisk/ui/table";
import { cn } from "@blinkdisk/utils/class";
import {
  DirectoryBreadcrumb,
  useDirectoryBreadcrumbPath,
} from "@desktop/components/directories/breadcrumb";
import { DirectoryMount } from "@desktop/components/directories/mount";
import { DirectoryNameCell } from "@desktop/components/directories/name";
import { DirectoryItemRow } from "@desktop/components/directories/row";
import { Empty } from "@desktop/components/empty";
import type { DirectoryItem as DirectoryItemType } from "@desktop/hooks/queries/core/use-directory";
import { useTheme } from "@desktop/hooks/use-theme";
import { formatSize } from "@desktop/lib/number";
import {
  type ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  type Table as TableType,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  FileSearchIcon,
  SearchIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type Item = DirectoryItemType & {
  skeleton?: boolean;
};

const columnHelper = createColumnHelper<Item>();

type DirectoryTableProps = {
  items: Item[] | undefined | null;
  onSelectionChange?: (selection: {
    items: Item[];
    allSelected: boolean;
  }) => void;
};

export function DirectoryTable({
  items,
  onSelectionChange,
}: DirectoryTableProps) {
  "use no memo";

  const { t } = useAppTranslation("directory.table");
  const { dark } = useTheme();
  const breadcrumbPath = useDirectoryBreadcrumbPath();
  const hasBreadcrumb = !!breadcrumbPath?.length;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [selection, setSelection] = useState({});
  const [filters, setFilters] = useState<ColumnFiltersState>([]);

  const parent = useRef<HTMLTableElement>(null);

  const columns = useMemo(() => {
    return [
      {
        id: "select",
        header: ({ table }: { table: TableType<Item> }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && false)
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="size-4.5 mb-1"
          />
        ),
        cell: ({ row }: { row: Row<Item> }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            disabled={!row.getCanSelect()}
            aria-label="Select row"
            className="size-4.5 mb-1 ml-1"
            preventPropagation
          />
        ),
        size: 37,
        enableSorting: false,
        enableHiding: false,
      },
      columnHelper.accessor("name", {
        header: () => t("name"),
        size: 0,
        minSize: 0,
        cell: (info) => <DirectoryNameCell info={info} dark={dark} />,
      }),
      columnHelper.accessor("stats.size", {
        header: () => t("size"),
        cell: (info) =>
          info.row.original?.skeleton ? (
            <Skeleton width={80} />
          ) : (
            formatSize(info.getValue() || 0)
          ),
        size: 120,
      }),
      columnHelper.accessor("modifiedAt", {
        header: () => t("modified"),
        cell: (info) =>
          info.row.original?.skeleton ? (
            <Skeleton width={100} />
          ) : (
            new Date(info.getValue() || 0).toLocaleString(undefined, {
              timeStyle: "short",
              dateStyle: "short",
            })
          ),
        size: 150,
      }),
    ];
  }, [t, dark]);

  const table = useReactTable({
    data: items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setSelection,
    onColumnFiltersChange: setFilters,
    getRowId: (row) => row.id,
    state: {
      sorting,
      rowSelection: selection,
      columnFilters: filters,
    },
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows?.length || 0,
    getScrollElement: () => parent.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  const virtualisedItems = virtualizer.getVirtualItems();

  const selectedFiles = useMemo(() => {
    return Object.keys(selection)
      .map((key) => items?.find((dir) => dir.id === key))
      .filter(Boolean) as Item[];
  }, [selection, items]);

  useEffect(() => {
    onSelectionChange?.({
      items: selectedFiles,
      allSelected: selectedFiles.length === items?.length,
    });
  }, [items?.length, onSelectionChange, selectedFiles]);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        {items !== null && items !== undefined && !items[0]?.skeleton ? (
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              placeholder={t("search.placeholder")}
              className="pl-9"
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table.getColumn("name")?.setFilterValue(e.target.value)
              }
            />
          </div>
        ) : (
          <Skeleton width="20rem" height="2.5rem" />
        )}
      </div>
      <DirectoryBreadcrumb />
      <DirectoryMount />
      {table.getColumn("name")?.getFilterValue() && rows.length === 0 ? (
        <Empty
          icon={<FileSearchIcon />}
          title={t("emptySearch.title")}
          description={t("emptySearch.description")}
        />
      ) : (
        <Table
          ref={parent}
          className="h-full w-full"
          containerClassName={cn(
            "h-full w-full",
            hasBreadcrumb ? "mt-4" : "mt-6",
            items?.[0]?.skeleton ? "overflow-y-hidden" : "overflow-y-auto",
          )}
        >
          <TableHeader className="sticky top-0 z-10 grid">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted hover:bg-muted flex w-full rounded-lg border"
              >
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width:
                          header.getSize() !== 0 ? header.getSize() : "100%",
                        flexShrink: header.getSize() !== 0 ? 0 : 1,
                      }}
                      className={cn(
                        "flex cursor-default select-none items-center",
                        index === 0 && "pl-3",
                      )}
                      onClick={(...args) => {
                        const handler = header.column.getToggleSortingHandler();
                        if (handler) handler(args);
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getIsSorted() === "asc" ? (
                        <ArrowUpIcon className="text-primary ml-1 size-4" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDownIcon className="text-primary ml-1 size-4" />
                      ) : null}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            key={JSON.stringify(selection)}
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
            className="relative table w-full"
          >
            {virtualisedItems.map((virtualRow) => (
              <DirectoryItemRow
                key={virtualRow.key}
                row={rows[virtualRow.index]}
                virtualRow={virtualRow}
                reset={() => {
                  setSelection({});
                  setFilters([]);
                }}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
