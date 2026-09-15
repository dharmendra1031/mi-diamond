import sql from "mssql";

declare global {
  // eslint-disable-next-line no-var
  var __miDiamondSqlPool: Promise<any> | undefined;
}

function connectionConfig() {
  const server = process.env.MSSQL_SERVER;
  const database = process.env.MSSQL_DATABASE;
  const user = process.env.MSSQL_USER;
  const password = process.env.MSSQL_PASSWORD;

  if (!server || !database || !user || !password) {
    throw new Error(
      "Missing MSSQL configuration. Set MSSQL_SERVER, MSSQL_DATABASE, MSSQL_USER and MSSQL_PASSWORD.",
    );
  }

  const port = Number(process.env.MSSQL_PORT || 1433);

  return {
    server,
    database,
    user,
    password,
    port,
    options: {
      encrypt: process.env.MSSQL_ENCRYPT === "true",
      trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== "false",
    },
    pool: {
      max: Number(process.env.MSSQL_POOL_MAX || 10),
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

export async function getPool() {
  if (!global.__miDiamondSqlPool) {
    global.__miDiamondSqlPool = new sql.ConnectionPool(connectionConfig()).connect();
  }

  try {
    return await global.__miDiamondSqlPool;
  } catch (error) {
    global.__miDiamondSqlPool = undefined;
    throw error;
  }
}

export async function query<T = Record<string, unknown>>(
  queryText: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const pool = await getPool();
  const request = pool.request();

  for (const [name, value] of Object.entries(params)) {
    request.input(name, value === undefined ? null : value);
  }

  const result = await request.query(queryText);
  return (result.recordset ?? []) as T[];
}

export async function execute(
  queryText: string,
  params: Record<string, unknown> = {},
) {
  const pool = await getPool();
  const request = pool.request();

  for (const [name, value] of Object.entries(params)) {
    request.input(name, value === undefined ? null : value);
  }

  return await request.query(queryText);
}
