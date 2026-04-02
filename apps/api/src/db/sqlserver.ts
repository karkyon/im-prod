import sql from "mssql";

const config: sql.config = {
  server: process.env.LEGACY_DB_HOST ?? "192.168.1.9",
  port: Number(process.env.LEGACY_DB_PORT ?? 1433),
  database: process.env.LEGACY_DB_NAME ?? "imotodb",
  user: process.env.LEGACY_DB_USER,
  password: process.env.LEGACY_DB_PASSWORD,
  options: {
    encrypt: false,          // オンプレ環境はfalse
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 15000,
  requestTimeout: 30000,
};

// シングルトンプール
let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) return pool;
  pool = await new sql.ConnectionPool(config).connect();
  console.log("✅ SQL Server接続プール確立");
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log("⏹️  SQL Server接続プール終了");
  }
}

export { sql };
