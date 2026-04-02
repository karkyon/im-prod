"use client";

import { usePartSearchStore } from "@/stores/partSearchStore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function Field({
  label,
  value,
  mono,
  wide,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
  mono?: boolean;
  wide?: boolean;
}) {
  const display =
    value === null || value === undefined || value === ""
      ? "—"
      : typeof value === "boolean"
        ? value
          ? "○"
          : "—"
        : String(value);

  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
        {label}
      </dt>
      <dd
        className={`text-xs text-foreground border-b border-dashed border-border pb-1 ${
          mono ? "font-mono" : ""
        }`}
      >
        {display}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-2 pb-1 border-b border-border">
        {title}
      </h3>
      <dl className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-3">
        {children}
      </dl>
    </section>
  );
}

export function BasicInfoTab() {
  const { selectedBasic: b, selectedRemarks: r, detailLoading } =
    usePartSearchStore();

  if (detailLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="h-8" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!b) return null;

  return (
    <div className="p-4 overflow-auto h-full space-y-5">
      {/* 識別情報 */}
      <Section title="識別情報">
        <Field label="部品ID" value={b.部品ID} mono />
        <Field label="図面番号" value={b.図面番号} mono />
        <Field label="名称" value={b.名称} />
        <Field label="主機種型式" value={b.主機種型式} />
        <Field label="得意先ID" value={b.得意先ID} mono />
        <Field label="得意先名" value={b.得意先名} />
      </Section>

      {/* 管理属性 */}
      <Section title="管理属性">
        <Field label="工程ID" value={b.工程ID} mono />
        <Field label="材料ID" value={b.材料ID} mono />
        <Field label="原価ID" value={b.原価ID} mono />
        <Field label="共通部品ID" value={b.共通部品ID} mono />
        <Field label="部品単価ID" value={b.部品単価ID} mono />
        <Field label="部品重量 (kg)" value={b.部品重量} />
        <Field label="作成日" value={b.作成日} />
        <Field label="登録日付" value={b.登録日付} />
        <Field label="更新日付" value={b.更新日付} />
      </Section>

      {/* 区分フラグ */}
      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-2 pb-1 border-b border-border">
          区分フラグ
        </h3>
        <div className="flex flex-wrap gap-2">
          <FlagBadge label="旧型" value={b.旧型区分} />
          <FlagBadge label="特別品" value={b.特別品区分} />
          <FlagBadge label="廃止部品" value={b.廃止部品区分} destructive />
          <FlagBadge label="事前準備品" value={b.事前準備品} />
        </div>
        {b.備考 && (
          <div className="mt-3 rounded-md bg-muted/50 p-2.5 text-xs">
            <span className="text-[10px] font-bold text-muted-foreground">備考: </span>
            {b.備考}
          </div>
        )}
      </section>

      {/* 在庫情報 */}
      <Section title="在庫情報">
        <Field
          label={`現在在庫数${b.現在在庫数 === 0 ? " ⚠️" : ""}`}
          value={b.現在在庫数}
        />
        <Field label="共通部品在庫数" value={b.共通部品在庫数} />
      </Section>

      {/* 材料情報 */}
      {(b.材質 || b.材料名称 || b.材料型式) && (
        <Section title="材料情報（基本）">
          <Field label="材質ID" value={b.材質ID} mono />
          <Field label="材質" value={b.材質} />
          <Field label="材料名称" value={b.材料名称} />
          <Field label="材料型式" value={b.材料型式} />
          <Field label="材料サイズ" value={b.材料サイズ} />
          <Field label="サイズ区分" value={b.サイズ区分} />
          <Field label="材料手配区分" value={b.材料手配区分} />
          <Field label="仕入先ID" value={b.mat仕入先ID} mono />
          {b.材料備考 && (
            <Field label="材料備考" value={b.材料備考} wide />
          )}
        </Section>
      )}

      {/* 備考4種 */}
      {r && (
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-2 pb-1 border-b border-border">
            備考 / 周知情報
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <RemarkBlock label="工程用備考" items={r.workProgress} />
            <RemarkBlock label="注文用備考" items={r.order} />
            <RemarkBlock label="手配時周知情報" items={r.dispatch} urgent />
            <RemarkBlock label="出荷用備考" items={r.delivery} />
          </div>
        </section>
      )}
    </div>
  );
}

function FlagBadge({
  label,
  value,
  destructive,
}: {
  label: string;
  value: boolean;
  destructive?: boolean;
}) {
  if (!value) return null;
  return (
    <Badge
      variant={destructive ? "destructive" : "secondary"}
      className="text-xs"
    >
      ● {label}
    </Badge>
  );
}

function RemarkBlock({
  label,
  items,
  urgent,
}: {
  label: string;
  items: { id: number; no: number; text: string }[];
  urgent?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-2.5 ${
        urgent && items.length > 0
          ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20"
          : "border-border bg-muted/20"
      }`}
    >
      <div
        className={`text-[10px] font-bold mb-1.5 ${
          urgent && items.length > 0
            ? "text-amber-700"
            : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      {items.length === 0 ? (
        <span className="text-[11px] text-muted-foreground/60">なし</span>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="text-xs leading-relaxed">
              {item.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}