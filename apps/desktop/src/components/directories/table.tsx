"use no memo";

import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { Checkbox } from "@blinkdisk/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@blinkdisk/ui/dropdown-menu";
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
  createTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableOptionsResolved,
  type Table as TableType,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  type PartialKeys,
  Virtualizer,
  type VirtualizerOptions,
} from "@tanstack/react-virtual";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  FileSearchIcon,
  SearchIcon,
} from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";

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

function getSelectedFiles(
  selection: RowSelectionState,
  items: Item[] | undefined | null,
) {
  return Object.keys(selection).flatMap((key) => {
    const item = items?.find((dir) => dir.id === key);
    return item ? [item] : [];
  });
}

function resolveSelectionUpdater(
  updater: Updater<RowSelectionState>,
  current: RowSelectionState,
) {
  return typeof updater === "function" ? updater(current) : updater;
}

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
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    mode: false,
    uid: false,
    gid: false,
  });

  const parent = useRef<HTMLTableElement>(null);

  const columns = [
    {
      id: "select",
      header: ({ table }: { table: TableType<Item> }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && false)
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      id: "size",
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
      id: "modified",
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
    columnHelper.accessor("meta.mode", {
      id: "mode",
      header: () => t("mode"),
      cell: (info) =>
        info.row.original?.skeleton ? <Skeleton width={70} /> : info.getValue(),
      size: 100,
    }),
    columnHelper.accessor("meta.uid", {
      id: "uid",
      header: () => t("uid"),
      cell: (info) =>
        info.row.original?.skeleton ? <Skeleton width={50} /> : info.getValue(),
      size: 80,
    }),
    columnHelper.accessor("meta.gid", {
      id: "gid",
      header: () => t("gid"),
      cell: (info) =>
        info.row.original?.skeleton ? <Skeleton width={50} /> : info.getValue(),
      size: 80,
    }),
  ];

  const notifySelectionChange = (nextSelection: RowSelectionState) => {
    const selectedItems = getSelectedFiles(nextSelection, items);
    onSelectionChange?.({
      items: selectedItems,
      allSelected: selectedItems.length === items?.length,
    });
  };

  const updateSelection = (updater: Updater<RowSelectionState>) => {
    const nextSelection = resolveSelectionUpdater(updater, selection);
    setSelection(nextSelection);
    notifySelectionChange(nextSelection);
  };

  const reset = () => {
    setSelection({});
    setFilters([]);
    notifySelectionChange({});
  };

  const table = useDirectoryTable({
    data: items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: updateSelection,
    onColumnFiltersChange: setFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: (row) => row.id,
    state: {
      sorting,
      rowSelection: selection,
      columnFilters: filters,
      columnVisibility,
    },
  });

  const { rows } = table.getRowModel();

  const virtualizer = useDirectoryVirtualizer({
    count: rows?.length || 0,
    getScrollElement: () => parent.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  const virtualisedItems = virtualizer.getVirtualItems();

  const columnLabels: Record<string, string> = {
    name: t("name"),
    size: t("size"),
    modified: t("modified"),
    mode: t("mode"),
    uid: t("uid"),
    gid: t("gid"),
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        {items !== null && items !== undefined && !items[0]?.skeleton ? (
          <>
            <div className="relative">
              <SearchIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                placeholder={t("search.placeholder")}
                className="h-10 pl-9"
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(e) =>
                  table.getColumn("name")?.setFilterValue(e.target.value)
                }
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="secondary" className="h-10 min-w-28 px-3">
                    {t("columns.button")}
                    <ChevronDownIcon className="ml-auto" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  {table.getAllColumns().flatMap((column) =>
                    column.getCanHide()
                      ? [
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {columnLabels[column.id] ?? column.id}
                          </DropdownMenuCheckboxItem>,
                        ]
                      : [],
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Skeleton width="20rem" height="2.5rem" />
            <Skeleton width="7rem" height="2.5rem" />
          </>
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
            key={JSON.stringify({ columnVisibility, selection })}
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
                reset={reset}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

const useIsomorphicLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;

function useDirectoryVirtualizer<
  TScrollElement extends Element,
  TItemElement extends Element,
>(
  options: PartialKeys<
    VirtualizerOptions<TScrollElement, TItemElement>,
    "observeElementRect" | "observeElementOffset" | "scrollToFn"
  >,
) {
  "use no memo";

  const rerender = useReducer((x: number) => x + 1, 0)[1];
  const resolvedOptions: VirtualizerOptions<TScrollElement, TItemElement> = {
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    ...options,
    onChange: (instance, sync) => {
      rerender();
      options.onChange?.(instance, sync);
    },
  };
  const [instance] = useState(
    () => new Virtualizer<TScrollElement, TItemElement>(resolvedOptions),
  );

  instance.setOptions(resolvedOptions);

  useIsomorphicLayoutEffect(() => instance._didMount(), [instance]);
  useIsomorphicLayoutEffect(() => instance._willUpdate());

  return instance;
}

function useDirectoryTable<TData extends RowData>(
  options: TableOptions<TData>,
) {
  "use no memo";

  const resolvedOptions: TableOptionsResolved<TData> = {
    state: {},
    onStateChange: () => {},
    renderFallbackValue: null,
    ...options,
  };
  const [table] = useState(() => createTable<TData>(resolvedOptions));
  const [state, setState] = useState(() => table.initialState);

  table.setOptions((prev) => ({
    ...prev,
    ...options,
    state: {
      ...state,
      ...options.state,
    },
    onStateChange: (updater) => {
      setState(updater);
      options.onStateChange?.(updater);
    },
  }));

  return table;
}
