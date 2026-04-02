import { getPool, sql, closePool } from "./sqlserver.js";

async function main() {
  console.log("🔌 SQL Server接続テスト開始...");
  console.log(`   Host: ${process.env.LEGACY_DB_HOST}:${process.env.LEGACY_DB_PORT}`);
  console.log(`   DB:   ${process.env.LEGACY_DB_NAME}`);
  console.log(`   User: ${process.env.LEGACY_DB_USER}`);

  try {
    const pool = await getPool();

    // バージョン確認
    const versionResult = await pool.request()
      .query("SELECT @@VERSION AS version, @@SERVERNAME AS server_name");
    console.log("\n✅ 接続成功!");
    console.log("   Server:", versionResult.recordset[0].server_name);
    console.log("   Version:", versionResult.recordset[0].version.split("\n")[0]);

    // テーブル一覧（部品関連のみ）
    const tableResult = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND TABLE_NAME LIKE '%part%'
          OR TABLE_NAME LIKE '%Part%'
          OR TABLE_NAME LIKE '%PART%'
          OR TABLE_NAME LIKE '%buhin%'
          OR TABLE_NAME LIKE '%Buhin%'
      ORDER BY TABLE_NAME
    `);
    console.log("\n📋 部品関連テーブル候補:");
    tableResult.recordset.forEach((r: { TABLE_NAME: string }) => {
      console.log("  -", r.TABLE_NAME);
    });

    // 全テーブル数確認
    const countResult = await pool.request().query(`
      SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    console.log(`\n📊 総テーブル数: ${countResult.recordset[0].cnt}`);

  } catch (err) {
    console.error("\n❌ 接続失敗:", err);
    process.exit(1);
  } finally {
    await closePool();
  }
}

main();
