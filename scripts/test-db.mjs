import fs from "node:fs";
import path from "node:path";
import sql from "mssql";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index <= 0) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
}

const instanceName = process.env.MSSQL_INSTANCE_NAME?.trim();
const config = {
  server: required("MSSQL_SERVER"),
  database: required("MSSQL_DATABASE"),
  user: required("MSSQL_USER"),
  password: required("MSSQL_PASSWORD"),
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === "true",
    trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== "false",
    ...(instanceName ? { instanceName } : {}),
  },
  ...(!instanceName ? { port: Number(process.env.MSSQL_PORT || 1433) } : {}),
};

const pool = await new sql.ConnectionPool(config).connect();
try {
  const result = await pool.request().query(`
    SELECT
      @@SERVERNAME AS [server_name],
      DB_NAME() AS [database_name],
      (SELECT COUNT_BIG(*) FROM [dbo].[categories]) AS [category_count],
      (SELECT COUNT_BIG(*) FROM [dbo].[products]) AS [product_count];
  `);
  const row = result.recordset[0];
  console.log("MSSQL connection: OK");
  console.log(`Server: ${row.server_name}`);
  console.log(`Database: ${row.database_name}`);
  console.log(`Categories: ${row.category_count}`);
  console.log(`Products: ${row.product_count}`);
} finally {
  await pool.close();
}
