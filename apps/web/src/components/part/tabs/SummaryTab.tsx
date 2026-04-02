"use client";

import {
  Package,
  Factory,
  ShoppingCart,
  ArrowDownUp,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  FileWarning,
  Cpu,
} from "lucide-react";
import { usePartSearchStore } from "@/stores/partSearchStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// ── メトリクスカードコンポーネント ─────────────────────────────
function MetricCard({
  title,
  icon: Icon,
  children,
  alert,
  className = "",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  alert?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border p-3 flex flex-col gap-2 ${
        alert
          ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20"
          : "border-border bg-card"
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          size={13}
          className={alert ? "text-amber-600" : "text-muted-foreground"}
        />
        <span
          className={`text-[10px] font-bold uppercase tracking-wide ${
            alert ? "text-amber-700" : "text-muted-foreground"
          }`}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ── メトリクス値コンポーネント ─────────────────────────────────
function MetricValue({
  value,
  unit,
  highlight,
}: {
  value: string | number | null | undefined;
  unit?: string;
  highlight?: "warn" | "ok" | "normal";
}) {
  const colorClass =
    highlight === "warn"
      ? "text-amber-600"
      : highlight === "ok"
        ? "text-emerald-600"
        : "text-foreground";

  return (
    <div className={`text-sm font-bold ${colorClass}`}>
      {value != null && value !== "" ? String(value) : "—"}
      {unit && (
        <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
          {unit}
        </span>
      )}
    </div>
  );
}

// ── メインコンポーネント ───────────────────────────────────────
export function SummaryTab() {
  const {
    selectedBasic: b,
    selectedMaterials: mat,
    selectedProcesses: proc,
    selectedWip: wip,
    detailLoading,
  } = usePartSearchStore();

  if (detailLoading) {
    return (
      <div className="p-4 grid grid-cols-2 xl:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!b) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        部品を選択するとサマリーを表示します
      </div>
    );
  }

  // 在庫計算
  const stockQty = b.現在在庫数 ?? 0;
  const commonStock = b.共通部品在庫数 ?? 0;
  const stockAlert = stockQty === 0;

  // 工程情報
  const processCount =
    proc?.processes?.length ?? 0;
  const processNames =
    proc?.processes
      ?.slice(0, 3)
      .map((p: { 工程?: string }) => p.工程 ?? "—")
      .join(" → ") ?? "—";

  // 材料情報
  const material = mat?.material ?? null;
  const subMaterialCount = mat?.subMaterials?.length ?? 0;
  const estimatesCount = mat?.estimates?.length ?? 0;

  // 仕掛/WIP
  const wipCount = wip?.length ?? 0;
  const activeWip = wip?.filter(
    (w: { 状況?: string }) => w.状況 === "加工中"
  );
  const waitingWip = wip?.filter(
    (w: { 状況?: string }) => w.状況 === "待ち"
  );

  // 外注見積
  const adoptedEstimate = proc?.contractEstimates?.find(
    (e: { 採用?: boolean | number }) => e.採用
  );

  return (
    <div className="p-3 overflow-auto h-full">
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">

        {/* ① 在庫情報 */}
        <MetricCard title="在庫情報" icon={Package} alert={stockAlert}>
          <div className="space-y-1.5">
            <div>
              <div className="text-[10px] text-muted-foreground">現在在庫</div>
              <MetricValue
                value={stockQty}
                unit="個"
                highlight={stockAlert ? "warn" : "ok"}
              />
            </div>
            {b.共通部品ID && (
              <div>
                <div className="text-[10px] text-muted-foreground">
                  共通部品在庫
                </div>
                <MetricValue
                  value={commonStock}
                  unit="個"
                  highlight={commonStock === 0 ? "warn" : "normal"}
                />
              </div>
            )}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {b.旧型区分 && (
                <Badge variant="secondary" className="text-[9px] h-4 px-1">
                  旧型
                </Badge>
              )}
              {b.特別品区分 && (
                <Badge variant="secondary" className="text-[9px] h-4 px-1">
                  特別品
                </Badge>
              )}
              {b.廃止部品区分 && (
                <Badge variant="destructive" className="text-[9px] h-4 px-1">
                  廃止
                </Badge>
              )}
            </div>
          </div>
        </MetricCard>

        {/* ② 材料情報 */}
        <MetricCard
          title="材料 / 副資材"
          icon={Factory}
          alert={!material}
        >
          <div className="space-y-1.5">
            {material ? (
              <>
                <div>
                  <div className="text-[10px] text-muted-foreground">材質</div>
                  <div className="text-xs font-semibold">
                    {material.材質 ?? b.材質 ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">サイズ</div>
                  <div className="text-xs text-muted-foreground">
                    {material.材料サイズ ?? b.材料サイズ ?? "—"}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="text-[10px] text-muted-foreground">材質</div>
                <div className="text-xs font-semibold">{b.材質 ?? "—"}</div>
                <div className="text-[10px] text-muted-foreground mt-1">サイズ</div>
                <div className="text-xs text-muted-foreground">
                  {b.材料サイズ ?? "—"}
                </div>
              </div>
            )}
            <div className="text-[10px] text-muted-foreground">
              副資材 {subMaterialCount}件 / 見積 {estimatesCount}件
            </div>
          </div>
        </MetricCard>

        {/* ③ 工程情報 */}
        <MetricCard
          title="工程 / 外注見積"
          icon={Wrench}
          alert={processCount === 0}
        >
          <div className="space-y-1.5">
            <div>
              <div className="text-[10px] text-muted-foreground">工程数</div>
              <MetricValue
                value={processCount}
                unit="工程"
                highlight={processCount === 0 ? "warn" : "normal"}
              />
            </div>
            {processCount > 0 && (
              <div>
                <div className="text-[10px] text-muted-foreground">工程フロー</div>
                <div className="text-[10px] text-foreground leading-relaxed">
                  {processNames}
                </div>
              </div>
            )}
            {adoptedEstimate && (
              <div>
                <div className="text-[10px] text-muted-foreground">採用見積</div>
                <div className="text-xs font-semibold">
                  {adoptedEstimate.見積金額?.toLocaleString() ?? "—"}{" "}
                  {adoptedEstimate.通貨区分 ?? ""}
                </div>
              </div>
            )}
          </div>
        </MetricCard>

        {/* ④ 製造進捗 / 仕掛 */}
        <MetricCard
          title="製造進捗 / 仕掛"
          icon={Cpu}
          alert={wipCount > 0}
          className={wipCount > 0 ? "" : ""}
        >
          <div className="space-y-1.5">
            <div>
              <div className="text-[10px] text-muted-foreground">仕掛件数</div>
              <MetricValue
                value={wipCount}
                unit="件"
                highlight={wipCount > 0 ? "warn" : "normal"}
              />
            </div>
            {wipCount > 0 && (
              <div className="flex flex-wrap gap-1">
                {(activeWip?.length ?? 0) > 0 && (
                  <span className="text-[9px] bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                    加工中 {activeWip?.length}件
                  </span>
                )}
                {(waitingWip?.length ?? 0) > 0 && (
                  <span className="text-[9px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                    待ち {waitingWip?.length}件
                  </span>
                )}
              </div>
            )}
            {wip && wip.length > 0 && wip[0]?.完成期日 && (
              <div>
                <div className="text-[10px] text-muted-foreground">
                  直近完成期日
                </div>
                <div className="text-[10px] text-foreground">
                  {wip[0].完成期日}
                </div>
              </div>
            )}
          </div>
        </MetricCard>

        {/* ⑤ 基本属性 */}
        <MetricCard title="基本属性" icon={ShoppingCart}>
          <div className="space-y-1.5">
            <div>
              <div className="text-[10px] text-muted-foreground">得意先</div>
              <div className="text-[11px] font-medium truncate">
                {b.得意先名 ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">主機種型式</div>
              <div className="text-[11px] text-muted-foreground">
                {b.主機種型式 ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">部品重量</div>
              <div className="text-[11px] text-muted-foreground">
                {b.部品重量 != null ? `${b.部品重量} kg` : "—"}
              </div>
            </div>
          </div>
        </MetricCard>

        {/* ⑥ 備考 / 周知 */}
        <MetricCard title="備考 / 周知" icon={AlertTriangle}>
          <div className="space-y-1">
            {/* storeからremarksを表示するが、selectedRemarksはstoreで別管理 */}
            <RemarksSummary />
          </div>
        </MetricCard>
      </div>
    </div>
  );
}

// 備考サマリー（selectedRemarksを別取得）
function RemarksSummary() {
  const { selectedRemarks } = usePartSearchStore();

  if (!selectedRemarks) {
    return (
      <div className="text-[10px] text-muted-foreground">読み込み中…</div>
    );
  }

  const hasAny =
    selectedRemarks.workProgress.length > 0 ||
    selectedRemarks.order.length > 0 ||
    selectedRemarks.dispatch.length > 0 ||
    selectedRemarks.delivery.length > 0;

  if (!hasAny) {
    return (
      <div className="flex items-center gap-1 text-[10px] text-emerald-600">
        <CheckCircle2 size={10} />
        <span>備考なし</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {selectedRemarks.workProgress.length > 0 && (
        <div>
          <div className="text-[9px] font-bold text-muted-foreground">
            工程用
          </div>
          <div className="text-[10px] line-clamp-2">
            {selectedRemarks.workProgress.map((r) => r.text).join(" / ")}
          </div>
        </div>
      )}
      {selectedRemarks.dispatch.length > 0 && (
        <div>
          <div className="text-[9px] font-bold text-amber-600">手配時周知</div>
          <div className="text-[10px] text-amber-700 line-clamp-2">
            {selectedRemarks.dispatch.map((r) => r.text).join(" / ")}
          </div>
        </div>
      )}
      {selectedRemarks.order.length > 0 && (
        <div>
          <div className="text-[9px] font-bold text-muted-foreground">
            注文用
          </div>
          <div className="text-[10px] line-clamp-1">
            {selectedRemarks.order.map((r) => r.text).join(" / ")}
          </div>
        </div>
      )}
    </div>
  );
}
