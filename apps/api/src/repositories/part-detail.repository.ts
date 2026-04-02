import { getPool, sql } from "../db/sqlserver.js";

// ════════════════════════════════════════════════
// 2. 部品基本情報
// ════════════════════════════════════════════════
export async function getPartBasic(partId: number) {
  const pool = await getPool();
  const result = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`
      SELECT
        b.部品ID, b.工程ID, b.材料ID, b.原価ID, b.不適合ID,
        b.共通部品ID, b.部品単価ID, b.部品備考ID,
        b.得意先ID,
        ISNULL(t.略称, t.得意先名) AS 得意先名,
        b.図面番号, b.名称, b.主機種型式,
        b.部品重量, b.作成日,
        b.旧型区分, b.特別品区分, b.廃止部品区分,
        b.事前準備品, b.備考,
        b.登録日付, b.登録時刻, b.登録者,
        b.更新日付, b.更新時刻, b.更新者,
        -- 在庫
        ISNULL(s.現在在庫数, 0)   AS 現在在庫数,
        ISNULL(ks.現在在庫数, 0)  AS 共通部品在庫数,
        -- 材料
        m.材料ID AS mat材料ID,
        m.材質ID, ms.材質,
        m.材料名称, m.材料型式, m.材料サイズ, m.サイズ区分,
        m.材料手配区分, m.仕入先ID AS mat仕入先ID,
        m.備考 AS 材料備考
      FROM 部品 b
      LEFT JOIN 得意先 t   ON b.得意先ID  = t.得意先ID
      LEFT JOIN 在庫 s     ON b.部品ID    = s.部品ID
      LEFT JOIN 在庫 ks    ON b.共通部品ID = ks.部品ID
      LEFT JOIN 部品材料 m  ON b.材料ID   = m.材料ID
      LEFT JOIN 材質記号 ms ON m.材質ID   = ms.材質ID
      WHERE b.部品ID = @partId
    `);
  return result.recordset[0] ?? null;
}

// ════════════════════════════════════════════════
// 3. 部品備考（4種）
// ════════════════════════════════════════════════
export async function getPartRemarks(partId: number) {
  const pool = await getPool();
  const result = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`
      SELECT 部品備考ID, 種別区分, 整列No, 備考
      FROM 部品備考
      WHERE 部品ID = @partId
      ORDER BY 種別区分, 整列No
    `);

  const byType = (type: number) =>
    result.recordset
      .filter(r => r.種別区分 === type)
      .map(r => ({ id: r.部品備考ID, no: r.整列No, text: r.備考 }));

  return {
    workProgress: byType(1), // 工程用備考
    order:        byType(2), // 注文用備考
    dispatch:     byType(3), // 手配時周知情報
    delivery:     byType(4), // 出荷用備考
  };
}

// ════════════════════════════════════════════════
// 4. 材料/副資材
// ════════════════════════════════════════════════
export async function getPartMaterials(partId: number) {
  const pool = await getPool();

  // 主材料
  const matRes = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`
      SELECT
        m.材料ID, m.部品ID, m.材質ID, ms.材質,
        m.材料名称, m.材料型式, m.材料サイズ, m.サイズ区分,
        m.材料手配区分, m.仕入先ID, sh.仕入先名, m.備考
      FROM 部品材料 m
      LEFT JOIN 材質記号 ms ON m.材質ID = ms.材質ID
      LEFT JOIN 仕入先 sh   ON m.仕入先ID = sh.仕入先ID
      WHERE m.部品ID = @partId
    `);
  const material = matRes.recordset[0] ?? null;

  // 材料見積（材料IDが必要）
  let estimates: object[] = [];
  if (material?.材料ID) {
    const estReq = pool.request();
    estReq.input("materialId", sql.Int, material.材料ID);
    const estRes = await estReq.query(`
      SELECT
        me.材料見積ID, me.材料ID, me.採用, me.注文用単価,
        me.仕入先ID, sh.仕入先名 AS 業者名,
        me.単位単価, me.単位, me.見積日付, me.備考
      FROM 材料見積 me
      LEFT JOIN 仕入先 sh ON me.仕入先ID = sh.仕入先ID
      WHERE me.材料ID = @materialId
      ORDER BY me.材料見積ID
    `);
    estimates = estRes.recordset;
  }

  // 副資材
  const subRes = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`
      SELECT
        bs.部品副資材ID, bs.副資材ID, bs.部品ID, bs.個数, bs.備考,
        s.副資材名, s.副資材区分,
        cls.副資材区分 AS 副資材区分名,
        s.部品ID AS 副資材部品ID,
        ISNULL(trd.仕入先名, ISNULL(s.仕入先名,'')) AS 仕入先名,
        s.仕入原価, s.設定単価
      FROM 部品副資材 bs
      LEFT JOIN 副資材 s             ON bs.副資材ID = s.副資材ID
      LEFT JOIN v_副資材区分 cls      ON s.副資材区分 = cls.ID
      LEFT JOIN v_副資材仕入先 trd    ON s.仕入先ID  = trd.仕入先ID
      WHERE bs.部品ID = @partId
      ORDER BY bs.部品副資材ID
    `);

  return { material, estimates, subMaterials: subRes.recordset };
}

// ════════════════════════════════════════════════
// 5. 工程/外注見積
// ════════════════════════════════════════════════
export async function getPartProcesses(partId: number) {
  const pool = await getPool();

  // 部品の工程IDを取得
  const idRes = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`SELECT ISNULL(工程ID, 0) AS 工程ID FROM 部品 WHERE 部品ID = @partId`);
  const koId = idRes.recordset[0]?.工程ID ?? 0;

  // 工程情報
  let processes: object[] = [];
  if (koId > 0) {
    const pRes = await pool.request()
      .input("koId", sql.Int, koId)
      .query(`
        SELECT
          p.工程ID, p.工程No, p.部品ID, p.工程区分,
          p.工程記号ID, kg.工程記号,
          p.工程, p.担当ID,
          ISNULL(gz.業者名, p.担当) AS 担当,
          p.受入担当, p.計画リードタイム, p.指示事項
        FROM 部品工程 p
        LEFT JOIN 工程記号 kg  ON p.工程記号ID = kg.工程記号ID
        LEFT JOIN 外注業者 gz  ON p.担当ID     = gz.外注業者ID
        WHERE p.工程ID = @koId
        ORDER BY p.工程No
      `);
    processes = pRes.recordset;
  }

  // 外注加工費見積
  const estRes = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`
      SELECT
        外注見積ID, 部品ID, 条件ID, 採用,
        工程No, 工程, 外注業者, 通貨区分,
        見積金額, 見積日, 担当者, 備考
      FROM 外注見積
      WHERE 部品ID = @partId
      ORDER BY 工程No
    `);

  return { processes, contractEstimates: estRes.recordset };
}
