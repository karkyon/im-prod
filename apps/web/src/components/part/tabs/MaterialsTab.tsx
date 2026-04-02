"use client";

import { usePartSearchStore } from "@/stores/partSearchStore";
import { Skeleton } from "@/components/ui/skeleton";

function LabelValue({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
        {label}
      </dt>
      <dd className={`text-xs mt-0.5 ${mono ? "font-mono" : ""}`}>
        {value != null && value !== "" ? String(value) : "—"}
      </dd>
    </div>
  );
}

export function MaterialsTab() {
  const { selectedMaterials: mat, detailLoading } = usePartSearchStore();

  if (detailLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }

  if (!mat) return null;

  const { material, estimates, subMaterials } = mat;

  return (
    <div className="p-3 space-y-4 overflow-auto h-full">
      {/* 主材料 */}
      <section className="rounded-lg border border-border p-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b border-border">
          主材料
        </h3>
        {material ? (
          <dl className="grid grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-3">
            <LabelValue label="材質" value={material.材質} />
            <LabelValue label="材料名称" value={material.材料名称} />
            <LabelValue label="材料型式" value={material.材料型式} mono />
            <LabelValue label="材料サイズ" value={material.材料サイズ} />
            <LabelValue label="サイズ区分" value={material.サイズ区分} />
            <LabelValue label="材料手配区分" value={material.材料手配区分} />
            <LabelValue label="仕入先名" value={material.仕入先名} />
            <LabelValue label="備考" value={material.備考} />
          </dl>
        ) : (
          <p className="text-xs text-muted-foreground">材料情報なし</p>
        )}
      </section>

      {/* 材料見積 */}
      <section className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/40 px-3 py-2 border-b border-border">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            材料見積 ({estimates?.length ?? 0}件)
          </h3>
        </div>
        {estimates && estimates.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-muted/30">
                <tr>
                  {["採用", "業者名", "注文用単価", "単位単価", "単位", "見積日", "備考"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground whitespace-nowrap border-b border-border"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {estimates.map(
                  (
                    est: {
                      材料見積ID: number;
                      採用?: boolean | number;
                      業者名?: string;
                      注文用単価?: number;
                      単位単価?: number;
                      単位?: string;
                      見積日付?: string;
                      備考?: string;
                    },
                    i: number
                  ) => (
                    <tr
                      key={est.材料見積ID ?? i}
                      className={`border-b border-border/50 ${
                        est.採用
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="px-2.5 py-2 text-center">
                        {est.採用 ? (
                          <span className="text-emerald-600 font-bold text-[11px]">
                            ✓
                          </span>
                        ) : (
                          ""
                        )}
                      </td>
                      <td className="px-2.5 py-2">{est.業者名 ?? "—"}</td>
                      <td className="px-2.5 py-2 text-right tabular-nums">
                        {est.注文用単価?.toLocaleString() ?? "—"}
                      </td>
                      <td className="px-2.5 py-2 text-right tabular-nums">
                        {est.単位単価?.toLocaleString() ?? "—"}
                      </td>
                      <td className="px-2.5 py-2">{est.単位 ?? "—"}</td>
                      <td className="px-2.5 py-2 whitespace-nowrap">
                        {est.見積日付 ?? "—"}
                      </td>
                      <td className="px-2.5 py-2 text-muted-foreground">
                        {est.備考 ?? ""}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground p-3">見積データなし</p>
        )}
      </section>

      {/* 副資材 */}
      <section className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/40 px-3 py-2 border-b border-border">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            副資材 ({subMaterials?.length ?? 0}件)
          </h3>
        </div>
        {subMaterials && subMaterials.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-muted/30">
                <tr>
                  {[
                    "副資材名",
                    "区分名",
                    "副資材部品ID",
                    "仕入先名",
                    "仕入原価",
                    "設定単価",
                    "個数",
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
                {subMaterials.map(
                  (
                    sub: {
                      部品副資材ID: number;
                      副資材名?: string;
                      副資材区分名?: string;
                      副資材部品ID?: number;
                      仕入先名?: string;
                      仕入原価?: number;
                      設定単価?: number;
                      個数?: number;
                      備考?: string;
                    },
                    i: number
                  ) => (
                    <tr
                      key={sub.部品副資材ID ?? i}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="px-2.5 py-2 font-medium">
                        {sub.副資材名 ?? "—"}
                      </td>
                      <td className="px-2.5 py-2 text-muted-foreground">
                        {sub.副資材区分名 ?? "—"}
                      </td>
                      <td className="px-2.5 py-2 font-mono">
                        {sub.副資材部品ID ?? "—"}
                      </td>
                      <td className="px-2.5 py-2">{sub.仕入先名 ?? "—"}</td>
                      <td className="px-2.5 py-2 text-right tabular-nums">
                        {sub.仕入原価?.toLocaleString() ?? "—"}
                      </td>
                      <td className="px-2.5 py-2 text-right tabular-nums">
                        {sub.設定単価?.toLocaleString() ?? "—"}
                      </td>
                      <td className="px-2.5 py-2 text-right tabular-nums">
                        {sub.個数 ?? "—"}
                      </td>
                      <td className="px-2.5 py-2 text-muted-foreground">
                        {sub.備考 ?? ""}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground p-3">副資材なし</p>
        )}
      </section>
    </div>
  );
}