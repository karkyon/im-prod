import { getPool, sql } from "../db/sqlserver.js";

// ════════════════════════════════════════════════
// 型定義
// ════════════════════════════════════════════════

export interface PartSearchParams {
  keyword?: string;
  partId?: number;
  drawingNo?: string;
  partName?: string;
  customerId?: number;
  customer?: string;
  machineType?: string;
  isOld?: boolean;
  isSpecial?: boolean;
  isDiscontinued?: boolean;
  hasAlert?: boolean;
  page?: number;
  limit?: number;
}

export interface PartListRow {
  partId: number;
  drawingNo: string | null;
  partName: string | null;
  machineType: string | null;
  customerId: number | null;
  customerName: string | null;
  stockQty: number;
  commonPartId: number | null;
  commonPartStockQty: number;
  pendingTotal: number;        // 総注残
  pendingToday: number;        // 今日現在の注残
  scheduledInQty: number;      // 入荷予定数（生産予定数）
  completionDate: string | null;
  latestPrice: number;
  wipQty: number;              // 仕掛在庫数
  lastInventoryInfo: string | null;
  isOld: boolean;
  isSpecial: boolean;
  isDiscontinued: boolean;
  hasDefect: boolean;
  updatedAt: string | null;
  status: "在庫注意" | "不適合あり" | "正常";
}

export interface PartSearchResult {
  rows: PartListRow[];
  total: number;
  page: number;
  limit: number;
}

// ════════════════════════════════════════════════
// 1. 部品検索一覧
// ════════════════════════════════════════════════
export async function searchParts(params: PartSearchParams): Promise<PartSearchResult> {
  const pool = await getPool();
  const page  = Math.max(1, params.page  ?? 1);
  const limit = Math.min(200, Math.max(1, params.limit ?? 50));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const req = pool.request();

  if (params.partId) {
    req.input("partId", sql.Int, params.partId);
    conditions.push("b.部品ID = @partId");
  }
  if (params.keyword) {
    req.input("keyword", sql.NVarChar, `%${params.keyword}%`);
    conditions.push("(CAST(b.部品ID AS NVARCHAR) LIKE @keyword OR b.図面番号 LIKE @keyword OR b.名称 LIKE @keyword)");
  }
  if (params.drawingNo) {
    req.input("drawingNo", sql.VarChar, `%${params.drawingNo}%`);
    conditions.push("b.図面番号 LIKE @drawingNo");
  }
  if (params.partName) {
    req.input("partName", sql.NVarChar, `%${params.partName}%`);
    conditions.push("b.名称 LIKE @partName");
  }
  if (params.customerId) {
    req.input("customerId", sql.Int, params.customerId);
    conditions.push("b.得意先ID = @customerId");
  }
  if (params.customer) {
    req.input("customer", sql.NVarChar, `%${params.customer}%`);
    conditions.push("(t.得意先名 LIKE @customer OR t.略称 LIKE @customer)");
  }
  if (params.machineType) {
    req.input("machineType", sql.VarChar, `%${params.machineType}%`);
    conditions.push("b.主機種型式 LIKE @machineType");
  }
  if (params.isOld !== undefined) {
    req.input("isOld", sql.Bit, params.isOld ? 1 : 0);
    conditions.push("b.旧型区分 = @isOld");
  }
  if (params.isSpecial !== undefined) {
    req.input("isSpecial", sql.Bit, params.isSpecial ? 1 : 0);
    conditions.push("b.特別品区分 = @isSpecial");
  }
  if (params.isDiscontinued !== undefined) {
    req.input("isDiscontinued", sql.Bit, params.isDiscontinued ? 1 : 0);
    conditions.push("b.廃止部品区分 = @isDiscontinued");
  }
  if (params.hasAlert) {
    conditions.push("ISNULL(s.現在在庫数, 0) = 0");
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  req.input("limit",  sql.Int, limit);
  req.input("offset", sql.Int, offset);

  const result = await req.query(`
    WITH
    -- 出庫集計ワーク
    出庫ワーク AS (
      SELECT 受注番号, SUM(出庫数量) AS 出庫数量, 部品ID
      FROM 出庫明細
      WHERE ISNULL(削除区分,'') <> '-1'
      GROUP BY 受注番号, 部品ID
    ),
    -- 総注残
    注残ワーク AS (
      SELECT j.部品ID,
             SUM(ISNULL(j.受注数量,0)) - SUM(ISNULL(sm.出庫数量,0)) AS 総注残
      FROM 受注 j LEFT JOIN 出庫ワーク sm ON j.受注番号 = sm.受注番号
      WHERE ISNULL(j.完納区分,'') <> '-1' AND ISNULL(j.削除区分,'') <> '-1'
      GROUP BY j.部品ID
      HAVING SUM(ISNULL(j.受注数量,0)) - SUM(ISNULL(sm.出庫数量,0)) <> 0
    ),
    -- 今日現在の注残
    今日注残ワーク AS (
      SELECT j.部品ID,
             SUM(ISNULL(j.受注数量,0)) - SUM(ISNULL(sm.出庫数量,0)) AS 今日注残
      FROM 受注 j LEFT JOIN 出庫ワーク sm ON j.受注番号 = sm.受注番号
      WHERE ISNULL(j.完納区分,'') <> '-1'
        AND ISNULL(j.納期,'') <= CONVERT(varchar,GETDATE(),111)
        AND ISNULL(j.削除区分,'') <> '-1'
      GROUP BY j.部品ID
      HAVING SUM(ISNULL(j.受注数量,0)) - SUM(ISNULL(sm.出庫数量,0)) <> 0
    ),
    -- 入荷予定（生産進捗が存在する生産情報）
    入荷予定ワーク AS (
      SELECT sj.部品ID,
             SUM(ISNULL(sj.生産予定数,0)) AS 入荷予定数,
             MIN(ISNULL(sj.完成期日,'')) AS 完成期日
      FROM 生産情報 sj INNER JOIN 生産進捗 sts ON sj.生産No = sts.生産No
      WHERE ISNULL(sj.削除区分,'') <> '-1'
      GROUP BY sj.部品ID
    ),
    -- 最新単価
    単価ワーク AS (
      SELECT tn.部品ID, ISNULL(tn.単価,0) AS 単価
      FROM 部品単価 tn
      WHERE tn.単価区分 = 1
        AND EXISTS (
          SELECT 1 FROM 部品単価 t2
          WHERE t2.部品ID = tn.部品ID AND t2.単価区分 = 1
          GROUP BY t2.部品ID
          HAVING ISNULL(tn.適用開始日付,'') = MAX(ISNULL(t2.適用開始日付,''))
        )
    ),
    -- 仕掛在庫（生産進捗が存在する件数）
    仕掛ワーク AS (
      SELECT sj.部品ID, COUNT(*) AS 仕掛件数
      FROM 生産進捗 sts INNER JOIN 生産情報 sj ON sts.生産No = sj.生産No
      WHERE ISNULL(sj.削除区分,'') <> '-1'
      GROUP BY sj.部品ID
    ),
    -- 不適合件数
    不適合ワーク AS (
      SELECT 部品ID, COUNT(*) AS 不適合件数
      FROM 部品不適合
      GROUP BY 部品ID
    ),
    -- メイン
    base AS (
      SELECT
        b.部品ID,
        b.図面番号,
        b.名称,
        b.主機種型式,
        b.得意先ID,
        ISNULL(t.略称, t.得意先名)          AS 得意先名,
        b.共通部品ID,
        ISNULL(s.現在在庫数, 0)             AS 現在在庫数,
        ISNULL(ks.現在在庫数, 0)            AS 共通部品在庫数,
        ISNULL(nw.入荷予定数, 0)            AS 入荷予定数,
        ISNULL(nw.完成期日, '')             AS 完成期日,
        ISNULL(sw1.総注残, 0)              AS 総注残,
        ISNULL(sw2.今日注残, 0)            AS 今日注残,
        ISNULL(zw.単価, 0)                AS 最新単価,
        ISNULL(kw.仕掛件数, 0)             AS 仕掛件数,
        ISNULL(fw.不適合件数, 0)            AS 不適合件数,
        ISNULL(lt.棚卸日, '')              AS 最終棚卸日,
        ISNULL(lt.現在在庫数, 0)           AS 棚卸在庫数,
        b.旧型区分,
        b.特別品区分,
        b.廃止部品区分,
        b.更新日付,
        COUNT(*) OVER()                    AS total
      FROM 部品 b
      LEFT JOIN 在庫 s   ON b.部品ID    = s.部品ID
      LEFT JOIN 在庫 ks  ON b.共通部品ID = ks.部品ID
      LEFT JOIN 得意先 t  ON b.得意先ID  = t.得意先ID
      LEFT JOIN 注残ワーク sw1   ON b.部品ID = sw1.部品ID
      LEFT JOIN 今日注残ワーク sw2 ON b.部品ID = sw2.部品ID
      LEFT JOIN 入荷予定ワーク nw  ON b.部品ID = nw.部品ID
      LEFT JOIN 単価ワーク zw     ON b.部品ID = zw.部品ID
      LEFT JOIN 仕掛ワーク kw     ON b.部品ID = kw.部品ID
      LEFT JOIN 不適合ワーク fw    ON b.部品ID = fw.部品ID
      LEFT JOIN v_最終棚卸 lt     ON b.部品ID = lt.部品ID
      ${where}
    )
    SELECT * FROM base
    ORDER BY 部品ID DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  const total = result.recordset.length > 0 ? result.recordset[0].total : 0;

  const rows: PartListRow[] = result.recordset.map(r => {
    const hasDefect = r.不適合件数 > 0;
    const stockQty  = r.現在在庫数 as number;
    const status: PartListRow["status"] =
      hasDefect ? "不適合あり" : stockQty === 0 ? "在庫注意" : "正常";
    const lastInv = r.最終棚卸日
      ? `最終棚卸日:${r.最終棚卸日}　在庫数:${r.棚卸在庫数}`
      : null;

    return {
      partId:            r.部品ID,
      drawingNo:         r.図面番号,
      partName:          r.名称,
      machineType:       r.主機種型式,
      customerId:        r.得意先ID,
      customerName:      r.得意先名,
      stockQty,
      commonPartId:      r.共通部品ID,
      commonPartStockQty: r.共通部品在庫数,
      pendingTotal:      r.総注残,
      pendingToday:      r.今日注残,
      scheduledInQty:    r.入荷予定数,
      completionDate:    r.完成期日 || null,
      latestPrice:       r.最新単価,
      wipQty:            r.仕掛件数,
      lastInventoryInfo: lastInv,
      isOld:             !!r.旧型区分,
      isSpecial:         !!r.特別品区分,
      isDiscontinued:    !!r.廃止部品区分,
      hasDefect,
      updatedAt:         r.更新日付,
      status,
    };
  });

  return { rows, total, page, limit };
}
