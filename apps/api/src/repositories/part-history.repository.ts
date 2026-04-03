import { getPool, sql } from "../db/sqlserver.js";

// ════════════════════════════════════════════════
// 6. 生産履歴 + 使用材料購入実績
// ════════════════════════════════════════════════
export async function getProductionHistory(partId: number) {
  const pool = await getPool();
  const result = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`
      SELECT
        生産No, 材料発注No, 外注発注No,
        ISNULL(削除区分,'') AS 削除区分,
        CASE ISNULL(削除区分,'') WHEN '-1' THEN 'キャンセル' ELSE '' END AS 削除,
        生産予定数, 生産手配日, 完成期日,
        生産完了日, 完成数, 副票数,
        手配区分, 材料条件, 必要納期, 頭出し個数,
        外注, 備考
      FROM 生産情報
      WHERE 部品ID = @partId
      ORDER BY 生産No DESC
    `);
  return result.recordset;
}

export async function getMaterialPurchaseHistory(productionNo: string) {
  const pool = await getPool();
  const result = await pool.request()
    .input("seisanNo", sql.VarChar, productionNo)
    .query(`
      SELECT
        z.材料発注No, z.部品ID, z.材料ID,
        z.材質, z.材料サイズ, z.サイズ区分,
        z.発注数, z.単位, z.納期, z.材料業者,
        z.発注日, z.備考
      FROM 生産使用材料 z
      INNER JOIN 生産情報 m ON z.材料発注No = m.材料発注No
      WHERE m.生産No = @seisanNo
      ORDER BY z.材料発注No
    `);
  return result.recordset;
}

// ════════════════════════════════════════════════
// 7. 受注/納品履歴
// ════════════════════════════════════════════════
export async function getOrderDeliveryHistory(partId: number) {
  const pool = await getPool();
  const result = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`
      SELECT
        部品ID, 取引先伝票番号, 図面番号, 名称, 主機種型式,
        受注数量, 納期, 出庫数量, 出庫日, 入力日,
        備考, 得意先ID, 納品場所Cd, 納品場所,
        単価, 完納, 納品状況,
        金額, 検収金額, 検収日
      FROM v_受注納品履歴
      WHERE 部品ID = @partId
      ORDER BY 納期 DESC
    `);
  return result.recordset;
}

// ════════════════════════════════════════════════
// 8. 入出庫履歴（UNION: 入庫 + 出庫 + 棚卸）
// ════════════════════════════════════════════════
export async function getInventoryMovements(partId: number) {
  const pool = await getPool();
  const result = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`
      SELECT
        '入庫'          AS 入出庫区分,
        nm.入庫ID       AS 入庫ID,
        NULL            AS 出庫ID,
        NULL            AS 棚卸ID,
        nm.入庫日       AS 移動日,
        nm.入庫数量,
        NULL            AS 出庫数量,
        iok.区分名      AS 入庫区分,
        ''              AS 出庫区分,
        ''              AS 伝票番号,
        sj.生産No,
        nm.備考
      FROM 入庫明細 nm
      LEFT JOIN v_入出庫理由 iok ON nm.入庫区分 = iok.区分No AND iok.入出 = 'I'
      LEFT JOIN 生産情報 sj      ON sj.生産No   = nm.生産番号
      WHERE nm.部品ID = @partId
        AND ISNULL(nm.削除区分,'') <> '-1'

      UNION ALL

      SELECT
        '出庫'          AS 入出庫区分,
        NULL            AS 入庫ID,
        sm.出庫ID,
        NULL            AS 棚卸ID,
        sm.出庫日       AS 移動日,
        NULL            AS 入庫数量,
        sm.出庫数量,
        ''              AS 入庫区分,
        iok.区分名      AS 出庫区分,
        ISNULL(jy.取引先伝票番号,'') AS 伝票番号,
        ''              AS 生産No,
        sm.備考
      FROM v_出庫明細 sm
      LEFT JOIN v_入出庫理由 iok ON sm.出庫区分 = iok.区分No AND iok.入出 = 'O'
      LEFT JOIN 受注 jy          ON jy.受注番号  = sm.受注番号
      WHERE sm.部品ID = @partId
        AND ISNULL(sm.削除区分,'') <> '-1'

      UNION ALL

      SELECT
        '棚卸し'        AS 入出庫区分,
        NULL            AS 入庫ID,
        NULL            AS 出庫ID,
        ID              AS 棚卸ID,
        棚卸日          AS 移動日,
        NULL            AS 入庫数量,
        NULL            AS 出庫数量,
        ''              AS 入庫区分,
        NULL            AS 出庫区分,
        NULL            AS 伝票番号,
        NULL            AS 生産No,
        '棚卸し確認 : 現在個数 [' + CONVERT(varchar, ISNULL(現在在庫数,0)) + ']' AS 備考
      FROM 棚卸
      WHERE 部品ID = @partId

      ORDER BY 移動日 DESC
    `);
  return result.recordset;
}

// ════════════════════════════════════════════════
// 9. ピッキング履歴
// ════════════════════════════════════════════════
export async function getPickingHistory(partId: number) {
  const pool = await getPool();
  const result = await pool.request()
    .input("partId", sql.VarChar, String(partId))
    .query(`
      SELECT
        作業日, 作業時刻, IPアドレス,
        出荷日, 図面番号, 部品ID,
        数量, 主機種型式, 名称
      FROM v_HT出庫履歴
      WHERE 部品ID = @partId
      ORDER BY 作業日 DESC, 作業時刻 DESC
    `);
  return result.recordset;
}

// ════════════════════════════════════════════════
// 10. キャンセル履歴
// ════════════════════════════════════════════════
export async function getCancellations(partId: number) {
  const pool = await getPool();
  const result = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`
      SELECT
        受注番号, 取引先伝票番号,
        受注数量, 出庫数量, 納期, 出庫日,
        単価, 金額, 検収金額, 検収日,
        削除区分, 完納区分,
        備考, キャンセル理由, 最終更新日
      FROM v_キャンセル一覧
      WHERE 部品ID = @partId
      ORDER BY 最終更新日 DESC
    `);
  return result.recordset;
}

// ════════════════════════════════════════════════
// 11. 単価改定履歴
// ════════════════════════════════════════════════
export async function getPriceHistory(partId: number) {
  const pool = await getPool();
  const result = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`
      SELECT
        部品単価ID, 部品ID, 単価区分, 通貨区分,
        単価, 改定日付, 適用開始日付,
        客先担当者, 事由
      FROM 部品単価
      WHERE 部品ID = @partId
      ORDER BY ISNULL(適用開始日付,'1900/01/01') DESC
    `);
  return result.recordset;
}

// ════════════════════════════════════════════════
// 12. 製造進捗/仕掛
// ════════════════════════════════════════════════
export async function getWip(partId: number) {
  const pool = await getPool();
  const result = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`
      SELECT
        sts.生産No,
        sj.材料発注No, sj.外注発注No,
        bh.図面番号, bh.名称, bh.主機種型式,
        sj.備考 AS 生産備考,
        sj.生産予定数, sj.生産手配日, sj.完成期日,
        sj.頭出し個数 AS 必要数,
        CASE WHEN sts.在庫品生産 = '-1' THEN '' ELSE '○' END AS 完成要求,
        bh.得意先ID,
        t.得意先名,
        pc.工程No, pc.工程, pc.担当,
        sts.進捗1, sts.進捗2,
        CASE
          WHEN sts.進捗1 = 0  THEN '材料'
          WHEN sts.進捗1 = 99 THEN '完成'
          ELSE ISNULL(pc.工程,'')
        END AS 進捗,
        CASE sts.進捗2
          WHEN 1 THEN '加工中'
          WHEN 2 THEN '待ち'
          WHEN 3 THEN '仕掛保管'
          ELSE ''
        END AS 状況,
        sts.在庫品生産,
        sts.進捗更新 AS 進捗更新日
      FROM 生産進捗 sts
      LEFT JOIN 生産情報 sj
        ON sts.生産No   = sj.生産No
      LEFT JOIN 部品工程 pc
        ON sj.工程ID    = pc.工程ID AND sts.進捗1 = pc.工程No
      INNER JOIN 部品 bh
        ON sj.部品ID    = bh.部品ID
      INNER JOIN 得意先 t
        ON bh.得意先ID  = t.得意先ID
      WHERE sj.部品ID = @partId
      ORDER BY sts.生産No DESC
    `);
  return result.recordset;
}

// ════════════════════════════════════════════════
// 13. 工程指示図（ファイルパスのみ返す）
// ════════════════════════════════════════════════
export async function getInstructionDiagrams(partId: number) {
  const pool = await getPool();
  const result = await pool.request()
    .input("partId", sql.Int, partId)
    .query(`
      SELECT 部品ID, ファイルNo, ファイルパス
      FROM 工程指示図
      WHERE 部品ID = @partId
    `);
  return result.recordset.map(r => ({
    partId:   r.部品ID,
    fileNo:   r.ファイルNo,
    filePath: r.ファイルパス,
    // UNCパスのまま返す。ファイル配信は将来フェーズで実装
    available: !!r.ファイルパス,
  }));
}

// ════════════════════════════════════════════════
// 14. 不具合一覧 (F-08)
// ════════════════════════════════════════════════
export async function getIssues(partId: number) {
  const pool = await getPool();

  // 部品不適合テーブルのスキーマに合わせてクエリを組む
  // カラム名が不明な場合は汎用的なSELECTで取得してNode側で整形
  try {
    const result = await pool.request()
      .input("partId", sql.Int, partId)
      .query(`
        SELECT
          ni.不適合ID,
          ni.部品ID,
          CASE ISNULL(ni.不適合状態区分, 0)
            WHEN 0 THEN '未対応'
            WHEN 1 THEN '調査中'
            WHEN 2 THEN '対応済'
            WHEN 3 THEN '再発監視'
            ELSE '未対応'
          END AS 状態,
          CONVERT(varchar(10), ni.発生日付, 111) AS 発生日,
          pc.工程 AS 工程,
          CASE ISNULL(ni.優先度区分, 2)
            WHEN 1 THEN '高'
            WHEN 2 THEN '中'
            WHEN 3 THEN '低'
            ELSE '中'
          END AS 優先度,
          ni.不具合内容 AS 内容,
          ni.原因 AS 原因,
          ni.再発防止 AS 再発防止,
          ni.担当者 AS 担当者,
          CONVERT(varchar(10), ni.完了日付, 111) AS 完了日,
          ni.備考 AS 備考
        FROM 部品不適合 ni
        LEFT JOIN 部品工程 pc
          ON ni.工程ID = pc.工程ID
          AND ni.工程No = pc.工程No
        WHERE ni.部品ID = @partId
        ORDER BY ni.発生日付 DESC
      `);
    return result.recordset;
  } catch (err) {
    // テーブル構造が異なる場合のフォールバック
    console.warn("部品不適合テーブルクエリ失敗、シンプルクエリで再試行:", err);
    try {
      const result2 = await pool.request()
        .input("partId", sql.Int, partId)
        .query(`
          SELECT *
          FROM 部品不適合
          WHERE 部品ID = @partId
          ORDER BY 不適合ID DESC
        `);
      return result2.recordset;
    } catch {
      return [];
    }
  }
}