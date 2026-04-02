"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PartListRow } from "@/types/parts";

interface PartsSearchTableProps {
  data: PartListRow[];
  total: number;
  selectedPartId: number | null;
  onSelectPart: (partId: number) => void;
  loading: boolean;
  pageSize?: number;
}

function StatusBadge({ status }: { status: PartListRow["status"] }) {
  if (status === "不適合あり")
    return (
      <Badge
        variant="destructive"
        className="text-[9px] py-0 px-1.5 h-4 whitespace-nowrap"
      >
        不適合
      </Badge>
    );
  if (status === "在庫注意")
    return (
      <Badge
        variant="outline"
        className="text-[9px] py-0 px-1.5 h-4 text-amber-600 border-amber-400 whitespace-nowrap"
      >
        在庫注意
      </Badge>
    );
  return null;
}

export function PartsSearchTable({
  data,
  total,
  selectedPartId,
  onSelectPart,
  loading,
  pageSize = 50,
}: PartsSearchTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<PartListRow>[]>(
    () => [
      {
        accessorKey: "partId",
        header: "部品ID",
        size: 72,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-foreground">
            {row.original.partId}
          </span>
        ),
      },
      {
        accessorKey: "drawingNo",
        header: "図面番号",
        size: 110,
        cell: ({ getValue }) => (
          <span className="text-[11px] text-muted-foreground truncate block">
            {(getValue() as string) ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "partName",
        header: "名称",
        size: 120,
        cell: ({ getValue }) => (
          <span className="text-[11px] text-foreground truncate block">
            {(getValue() as string) ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "stockQty",
        header: "在庫",
        size: 52,
        cell: ({ getValue, row }) => {
          const qty = getValue() as number;
          return (
            <span
              className={`text-xs font-bold tabular-nums ${
                qty === 0 ? "text-amber-600" : "text-foreground"
              }`}
            >
              {qty}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "状態",
        size: 66,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize },
    },
  });

  const { pageIndex, pageSize: ps } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const firstRow = pageIndex * ps + 1;
  const lastRow = Math.min((pageIndex + 1) * ps, data.length);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* カウント表示 */}
      <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-b border-border bg-muted/30 shrink-0 flex items-center justify-between">
        <span>
          {total.toLocaleString()} 件中{" "}
          {data.length < total ? `${data.length}件表示` : "全件"}
        </span>
        {data.length > 0 && (
          <span>
            {firstRow}–{lastRow}
          </span>
        )}
      </div>

      {/* テーブル */}
      <div className="flex-1 overflow-auto min-h-0 scroll-thin">
        {loading ? (
          <div className="p-3 space-y-1.5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-8 rounded bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            条件を入力して検索してください
          </div>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="bg-muted/60 border-b border-border px-2 py-1.5 text-left text-[10px] font-bold text-muted-foreground whitespace-nowrap select-none"
                      style={{ width: header.getSize() }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className="flex items-center gap-0.5 cursor-pointer">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-muted-foreground/50">
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp size={10} />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown size={10} />
                            ) : (
                              <ChevronsUpDown size={10} />
                            )}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const isSelected =
                  row.original.partId === selectedPartId;
                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelectPart(row.original.partId)}
                    className={`cursor-pointer border-b border-border/50 transition-colors ${
                      isSelected
                        ? "bg-primary/10 border-l-2 border-l-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-2 py-1.5 overflow-hidden"
                        style={{ maxWidth: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ページネーション */}
      {!loading && pageCount > 1 && (
        <div className="shrink-0 border-t border-border bg-background px-2 py-1.5 flex items-center justify-between gap-1">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="最初"
            >
              <ChevronsLeft size={12} />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="前へ"
            >
              <ChevronLeft size={12} />
            </button>
          </div>

          <span className="text-[10px] text-muted-foreground">
            {pageIndex + 1} / {pageCount}
          </span>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="次へ"
            >
              <ChevronRight size={12} />
            </button>
            <button
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="最後"
            >
              <ChevronsRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
