"use client";

import { usePartSearchStore } from "@/stores/partSearchStore";
import { Skeleton } from "@/components/ui/skeleton";

export function ProcessesTab() {
  const { selectedProcesses: proc, detailLoading } = usePartSearchStore();

  if (detailLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }

  if (!proc) return null;

  const { processes, contractEstimates } = proc;

  return (
    <div className="p-3 space-y-4 overflow-auto h-full">
      {/* 工程フロー（視覚的） */}
      {processes && processes.length > 0 && (
        <section className="rounded-lg border border-border p-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5 pb-1 border-b border-border">
            工程フロー
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <FlowStep label="材料" step={0} />
            {processes.map(
              (
                p: { 工程No?: number; 工程?: string },
                i: number
              ) => (
                <span key={i} className="flex items-center gap-1.5">
                  <Arrow />
                  <FlowStep label={p.工程 ?? `工程${p.工程No}`} step={i + 1} />
                </span>
              )
            )}
            <span className="flex items-center gap-1.5">
              <Arrow />
              <FlowStep label="完成" step={-1} done />
            </span>
          </div>
        </section>
      )}

      {/* 工程情報テーブル */}
      <section className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/40 px-3 py-2 border-b border-border flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            工程情報 ({processes?.length ?? 0}工程)
          </h3>
        </div>
        {processes && processes.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-muted/30">
                <tr>
                  {[
                    "工程No",
                    "工程記号",
                    "工程",
                    "担当",
                    "受入担当",
                    "計画LT",
                    "指示事項",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground whitespace-nowrap border-b border-border"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processes.map(
                  (
                    p: {
                      工程No?: number;
                      工程記号?: string;
                      工程?: string;
                      担当?: string;
                      受入担当?: string;
                      計画リードタイム?: number;
                      指示事項?: string;
                    },
                    i: number
                  ) => (
                    <tr
                      key={i}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="px-2.5 py-2 font-bold text-center">
                        {p.工程No ?? i + 1}
                      </td>
                      <td className="px-2.5 py-2 font-mono text-muted-foreground">
                        {p.工程記号 ?? "—"}
                      </td>
                      <td className="px-2.5 py-2 font-medium">{p.工程 ?? "—"}</td>
                      <td className="px-2.5 py-2">{p.担当 ?? "—"}</td>
                      <td className="px-2.5 py-2">{p.受入担当 ?? "—"}</td>
                      <td className="px-2.5 py-2 text-center">
                        {p.計画リードタイム != null
                          ? `${p.計画リードタイム}日`
                          : "—"}
                      </td>
                      <td className="px-2.5 py-2 text-muted-foreground max-w-48 truncate">
                        {p.指示事項 ?? ""}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground p-3">工程情報なし</p>
        )}
      </section>

      {/* 外注加工費見積 */}
      <section className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/40 px-3 py-2 border-b border-border">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            外注加工費見積 ({contractEstimates?.length ?? 0}件)
          </h3>
        </div>
        {contractEstimates && contractEstimates.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-muted/30">
                <tr>
                  {[
                    "採用",
                    "工程No",
                    "工程",
                    "外注業者",
                    "見積金額",
                    "通貨",
                    "見積日",
                    "担当者",
                    "備考",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground whitespace-nowrap border-b border-border"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contractEstimates.map(
                  (
                    e: {
                      外注見積ID?: number;
                      採用?: boolean | number;
                      工程No?: number;
                      工程?: string;
                      外注業者?: string;
                      見積金額?: number;
                      通貨区分?: string;
                      見積日?: string;
                      担当者?: string;
                      備考?: string;
                    },
                    i: number
                  ) => (
                    <tr
                      key={e.外注見積ID ?? i}
                      className={`border-b border-border/50 ${
                        e.採用
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="px-2.5 py-2 text-center">
                        {e.採用 ? (
                          <span className="text-emerald-600 font-bold">✓採用</span>
                        ) : (
                          ""
                        )}
                      </td>
                      <td className="px-2.5 py-2 text-center">
                        {e.工程No ?? "—"}
                      </td>
                      <td className="px-2.5 py-2">{e.工程 ?? "—"}</td>
                      <td className="px-2.5 py-2">{e.外注業者 ?? "—"}</td>
                      <td className="px-2.5 py-2 text-right tabular-nums font-medium">
                        {e.見積金額?.toLocaleString() ?? "—"}
                      </td>
                      <td className="px-2.5 py-2">{e.通貨区分 ?? "—"}</td>
                      <td className="px-2.5 py-2 whitespace-nowrap">
                        {e.見積日 ?? "—"}
                      </td>
                      <td className="px-2.5 py-2">{e.担当者 ?? "—"}</td>
                      <td className="px-2.5 py-2 text-muted-foreground">
                        {e.備考 ?? ""}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground p-3">外注見積なし</p>
        )}
      </section>
    </div>
  );
}

function Arrow() {
  return <span className="text-muted-foreground text-xs">→</span>;
}

function FlowStep({
  label,
  step,
  done,
}: {
  label: string;
  step: number;
  done?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border ${
        done
          ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400"
          : step === 0
            ? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
            : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400"
      }`}
    >
      {label}
    </span>
  );
}