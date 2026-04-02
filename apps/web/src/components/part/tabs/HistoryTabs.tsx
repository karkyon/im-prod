"use client";

import { usePartSearchStore } from "@/stores/partSearchStore";
import { Skeleton } from "@/components/ui/skeleton";

// ── 汎用テーブルコンポーネント ──────────────────────────────────
function HistoryTable({
  headers,
  rows,
  loading,
  emptyMessage,
}: {
  headers: string[];
  rows: (string | number | null | undefined)[][];
  loading?: boolean;
  emptyMessage?: string;
}) {
  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <p className="text-xs text-muted-foreground p-3">
        {emptyMessage ?? "データなし"}
      </p>
    );
  }
  return (
    <div className="overflow-auto">
      <table className="w-full text-xs border-collapse">
        <thead className="bg-muted/30 sticky top-0">
          <tr>
            {headers.map((h) => (
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
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/50 hover:bg-muted/30">
              {row.map((cell, ci) => (
                <td key={ci} className="px-2.5 py-1.5 whitespace-nowrap">
                  {cell != null ? String(cell) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── SectionWrap ────────────────────────────────────────────────
function SectionWrap({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border overflow-hidden">
      <div className="bg-muted/40 px-3 py-2 border-b border-border">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {title}
          {count != null && (
            <span className="ml-2 text-muted-foreground/60">({count}件)</span>
          )}
        </h3>
      </div>
      {children}
    </section>
  );
}

// ── 生産履歴タブ ───────────────────────────────────────────────
export function ProductionHistoryTab() {
  const {
    selectedProductionHistory: data,
    tabLoadState,
    detailLoading,
  } = usePartSearchStore();
  const state = tabLoadState["production"];

  return (
    <div className="p-3 space-y-4 overflow-auto h-full">
      <SectionWrap title="生産履歴" count={data?.length}>
        <HistoryTable
          loading={detailLoading || state.loading}
          emptyMessage="生産履歴なし"
          headers={[
            "生産No",
            "削除",
            "材料発注No",
            "外注発注No",
            "生産予定数",
            "生産手配日",
            "完成期日",
            "生産完了日",
            "完成数",
            "備考",
          ]}
          rows={(data ?? []).map(
            (r: {
              生産No?: string;
              削除?: string;
              材料発注No?: string;
              外注発注No?: string;
              生産予定数?: number;
              生産手配日?: string;
              完成期日?: string;
              生産完了日?: string;
              完成数?: number;
              備考?: string;
            }) => [
              r.生産No,
              r.削除,
              r.材料発注No,
              r.外注発注No,
              r.生産予定数,
              r.生産手配日,
              r.完成期日,
              r.生産完了日,
              r.完成数,
              r.備考,
            ]
          )}
        />
      </SectionWrap>
      {state.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </div>
  );
}

// ── 受注/納品履歴タブ ──────────────────────────────────────────
export function OrdersTab() {
  const {
    selectedOrders: data,
    tabLoadState,
    detailLoading,
  } = usePartSearchStore();
  const state = tabLoadState["orders"];

  return (
    <div className="p-3 overflow-auto h-full">
      <SectionWrap title="受注 / 納品履歴" count={data?.length}>
        <HistoryTable
          loading={detailLoading || state.loading}
          emptyMessage="受注/納品履歴なし"
          headers={[
            "取引先伝票番号",
            "受注数量",
            "納期",
            "出庫数量",
            "出庫日",
            "入力日",
            "単価",
            "金額",
            "検収金額",
            "検収日",
            "納品状況",
            "完納",
            "納品場所",
            "備考",
          ]}
          rows={(data ?? []).map(
            (r: {
              取引先伝票番号?: string;
              受注数量?: number;
              納期?: string;
              出庫数量?: number;
              出庫日?: string;
              入力日?: string;
              単価?: string | number;
              金額?: string | number;
              検収金額?: string | number;
              検収日?: string;
              納品状況?: string;
              完納?: string;
              納品場所?: string;
              備考?: string;
            }) => [
              r.取引先伝票番号,
              r.受注数量,
              r.納期,
              r.出庫数量,
              r.出庫日,
              r.入力日,
              r.単価,
              r.金額,
              r.検収金額,
              r.検収日,
              r.納品状況,
              r.完納,
              r.納品場所,
              r.備考,
            ]
          )}
        />
      </SectionWrap>
      {state.error && (
        <p className="text-xs text-destructive p-3">{state.error}</p>
      )}
    </div>
  );
}

// ── 入出庫履歴タブ ─────────────────────────────────────────────
export function InventoryTab() {
  const {
    selectedInventoryMovements: data,
    tabLoadState,
    detailLoading,
  } = usePartSearchStore();
  const state = tabLoadState["inventory"];

  return (
    <div className="p-3 overflow-auto h-full">
      <SectionWrap title="入出庫履歴" count={data?.length}>
        <HistoryTable
          loading={detailLoading || state.loading}
          emptyMessage="入出庫履歴なし"
          headers={[
            "区分",
            "移動日",
            "入庫数",
            "出庫数",
            "入庫区分",
            "出庫区分",
            "伝票番号",
            "生産No",
            "備考",
          ]}
          rows={(data ?? []).map(
            (r: {
              入出庫区分?: string;
              移動日?: string;
              入庫数量?: number;
              出庫数量?: number;
              入庫区分?: string;
              出庫区分?: string;
              伝票番号?: string;
              生産No?: string;
              備考?: string;
            }) => [
              r.入出庫区分,
              r.移動日,
              r.入庫数量,
              r.出庫数量,
              r.入庫区分,
              r.出庫区分,
              r.伝票番号,
              r.生産No,
              r.備考,
            ]
          )}
        />
      </SectionWrap>
      {state.error && (
        <p className="text-xs text-destructive p-3">{state.error}</p>
      )}
    </div>
  );
}

// ── ピッキング履歴タブ ─────────────────────────────────────────
export function PickingHistoryTab() {
  const {
    selectedPickingHistory: data,
    tabLoadState,
    detailLoading,
  } = usePartSearchStore();
  const state = tabLoadState["picking"];

  return (
    <div className="p-3 overflow-auto h-full">
      <SectionWrap title="ピッキング履歴" count={data?.length}>
        <HistoryTable
          loading={detailLoading || state.loading}
          emptyMessage="ピッキング履歴なし"
          headers={[
            "作業日",
            "作業時刻",
            "出荷日",
            "数量",
            "IPアドレス",
            "図面番号",
            "名称",
            "主機種型式",
          ]}
          rows={(data ?? []).map(
            (r: {
              作業日?: string;
              作業時刻?: string;
              出荷日?: string;
              数量?: number;
              IPアドレス?: string;
              図面番号?: string;
              名称?: string;
              主機種型式?: string;
            }) => [
              r.作業日,
              r.作業時刻,
              r.出荷日,
              r.数量,
              r.IPアドレス,
              r.図面番号,
              r.名称,
              r.主機種型式,
            ]
          )}
        />
      </SectionWrap>
      {state.error && (
        <p className="text-xs text-destructive p-3">{state.error}</p>
      )}
    </div>
  );
}

// ── キャンセル履歴タブ ─────────────────────────────────────────
export function CancellationsTab() {
  const {
    selectedCancellations: data,
    tabLoadState,
    detailLoading,
  } = usePartSearchStore();
  const state = tabLoadState["cancellations"];

  return (
    <div className="p-3 overflow-auto h-full">
      <SectionWrap title="キャンセル履歴" count={data?.length}>
        <HistoryTable
          loading={detailLoading || state.loading}
          emptyMessage="キャンセル履歴なし"
          headers={[
            "受注番号",
            "取引先伝票番号",
            "受注数量",
            "出庫数量",
            "納期",
            "出庫日",
            "単価",
            "金額",
            "検収金額",
            "検収日",
            "削除区分",
            "完納区分",
            "キャンセル理由",
            "最終更新日",
          ]}
          rows={(data ?? []).map(
            (r: {
              受注番号?: string;
              取引先伝票番号?: string;
              受注数量?: number;
              出庫数量?: number;
              納期?: string;
              出庫日?: string;
              単価?: string | number;
              金額?: string | number;
              検収金額?: string | number;
              検収日?: string;
              削除区分?: string;
              完納区分?: string;
              キャンセル理由?: string;
              最終更新日?: string;
            }) => [
              r.受注番号,
              r.取引先伝票番号,
              r.受注数量,
              r.出庫数量,
              r.納期,
              r.出庫日,
              r.単価,
              r.金額,
              r.検収金額,
              r.検収日,
              r.削除区分,
              r.完納区分,
              r.キャンセル理由,
              r.最終更新日,
            ]
          )}
        />
      </SectionWrap>
      {state.error && (
        <p className="text-xs text-destructive p-3">{state.error}</p>
      )}
    </div>
  );
}

// ── 単価改定履歴タブ ───────────────────────────────────────────
export function PriceHistoryTab() {
  const {
    selectedPriceHistory: data,
    tabLoadState,
    detailLoading,
  } = usePartSearchStore();
  const state = tabLoadState["priceHistory"];

  return (
    <div className="p-3 overflow-auto h-full">
      <SectionWrap title="単価改定履歴" count={data?.length}>
        <HistoryTable
          loading={detailLoading || state.loading}
          emptyMessage="単価改定履歴なし"
          headers={[
            "単価区分",
            "通貨区分",
            "単価",
            "改定日付",
            "適用開始日付",
            "客先担当者",
            "事由",
          ]}
          rows={(data ?? []).map(
            (r: {
              単価区分?: string | number;
              通貨区分?: string | number;
              単価?: number;
              改定日付?: string;
              適用開始日付?: string;
              客先担当者?: string;
              事由?: string;
            }) => [
              r.単価区分,
              r.通貨区分,
              r.単価?.toLocaleString(),
              r.改定日付,
              r.適用開始日付,
              r.客先担当者,
              r.事由,
            ]
          )}
        />
      </SectionWrap>
      {state.error && (
        <p className="text-xs text-destructive p-3">{state.error}</p>
      )}
    </div>
  );
}

// ── 製造進捗/仕掛タブ ──────────────────────────────────────────
export function WipTab() {
  const { selectedWip: data, detailLoading } = usePartSearchStore();

  return (
    <div className="p-3 overflow-auto h-full">
      <SectionWrap title="製造進捗 / 仕掛" count={data?.length}>
        <HistoryTable
          loading={detailLoading}
          emptyMessage="仕掛データなし"
          headers={[
            "生産No",
            "進捗",
            "状況",
            "生産予定数",
            "必要数",
            "完了要求",
            "担当",
            "完成期日",
            "進捗更新日",
            "備考",
          ]}
          rows={(data ?? []).map(
            (r: {
              生産No?: string;
              進捗?: string;
              状況?: string;
              生産予定数?: number;
              必要数?: number;
              完成要求?: string;
              担当?: string;
              完成期日?: string;
              進捗更新日?: string;
              生産備考?: string;
            }) => [
              r.生産No,
              r.進捗,
              r.状況,
              r.生産予定数,
              r.必要数,
              r.完成要求,
              r.担当,
              r.完成期日,
              r.進捗更新日,
              r.生産備考,
            ]
          )}
        />
      </SectionWrap>
    </div>
  );
}

// ── 工程指示図タブ ─────────────────────────────────────────────
export function DiagramsTab() {
  const {
    selectedInstructionDiagrams: data,
    tabLoadState,
    detailLoading,
  } = usePartSearchStore();
  const state = tabLoadState["diagrams"];

  const loading = detailLoading || state.loading;

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-10" />
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 overflow-auto h-full">
      <section className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/40 px-3 py-2 border-b border-border">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            工程指示図 ({data?.length ?? 0}件)
          </h3>
        </div>

        {!data || data.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-muted-foreground text-sm">
              工程指示図が登録されていません
            </div>
            <p className="text-xs text-muted-foreground/60 mt-1">
              ファイルサーバーとの連携で表示予定
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.map(
              (
                d: {
                  partId?: number;
                  fileNo?: number;
                  filePath?: string;
                  available?: boolean;
                },
                i: number
              ) => (
                <div key={i} className="px-3 py-2.5 flex items-center gap-3">
                  <div className="shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {d.fileNo ?? i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {d.filePath ?? "—"}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {d.available
                        ? "ファイルパス登録済み"
                        : "未登録"}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      d.available
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {d.available ? "登録済" : "未登録"}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
        ⚠️ 図面ファイルの直接表示はファイルサーバー連携フェーズで実装予定（UNCパス: \\Server2\zumen\）
      </div>

      {state.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </div>
  );
}