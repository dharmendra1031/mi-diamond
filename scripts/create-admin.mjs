import fs from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
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

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
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

const email = required("ADMIN_EMAIL").trim().toLowerCase();
const password = required("ADMIN_PASSWORD");
const fullName = (process.env.ADMIN_NAME || "Michael Jewellery Admin").trim();

if (password.length < 8) {
  throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
}

const pool = await new sql.ConnectionPool(config).connect();
try {
  const request = pool.request();
  request.input("email", email);
  request.input("password_hash", hashPassword(password));
  request.input("full_name", fullName);

  const result = await request.query(`
    DECLARE @UserId uniqueidentifier;
    SELECT @UserId = [id] FROM [dbo].[users] WHERE LOWER([email]) = LOWER(@email);

    IF @UserId IS NULL
    BEGIN
      SET @UserId = NEWID();
      INSERT INTO [dbo].[users] ([id], [email], [password_hash])
      VALUES (@UserId, @email, @password_hash);
    END
    ELSE
    BEGIN
      UPDATE [dbo].[users]
      SET [password_hash] = @password_hash, [updated_at] = SYSUTCDATETIME()
      WHERE [id] = @UserId;
    END

    IF EXISTS (SELECT 1 FROM [dbo].[profiles] WHERE [id] = @UserId)
      UPDATE [dbo].[profiles]
      SET [full_name] = @full_name, [is_admin] = 1, [updated_at] = SYSUTCDATETIME()
      WHERE [id] = @UserId;
    ELSE
      INSERT INTO [dbo].[profiles] ([id], [full_name], [is_admin])
      VALUES (@UserId, @full_name, 1);

    DELETE FROM [dbo].[sessions] WHERE [user_id] = @UserId;
    SELECT CONVERT(nvarchar(36), @UserId) AS [id];
  `);

  console.log(`Admin ready: ${email}`);
  console.log(`User ID: ${result.recordset[0]?.id}`);
} finally {
  await pool.close();
}
