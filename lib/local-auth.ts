import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { execute, query } from "@/lib/mssql";

export const SESSION_COOKIE = "mi_session";
const SESSION_DAYS = 14;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);

  await execute(
    `INSERT INTO [dbo].[sessions] ([user_id], [token_hash], [expires_at])
     VALUES (@user_id, @token_hash, DATEADD(day, @days, SYSUTCDATETIME()));`,
    { user_id: userId, token_hash: tokenHash, days: SESSION_DAYS },
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.SESSION_COOKIE_SECURE === "true",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await execute(
      "DELETE FROM [dbo].[sessions] WHERE [token_hash] = @token_hash;",
      { token_hash: hashSessionToken(token) },
    );
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await query<Record<string, any>>(
    `SELECT TOP (1)
       u.[id], u.[email], u.[password_hash],
       p.[full_name], p.[phone], p.[is_admin]
     FROM [dbo].[sessions] s
     INNER JOIN [dbo].[users] u ON u.[id] = s.[user_id]
     LEFT JOIN [dbo].[profiles] p ON p.[id] = u.[id]
     WHERE s.[token_hash] = @token_hash
       AND s.[expires_at] > SYSUTCDATETIME();`,
    { token_hash: hashSessionToken(token) },
  );

  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    email: String(row.email),
    password_hash: String(row.password_hash),
    full_name: row.full_name == null ? null : String(row.full_name),
    phone: row.phone == null ? null : String(row.phone),
    is_admin: Boolean(row.is_admin),
  };
}

export async function getUserByEmail(email: string) {
  const rows = await query<Record<string, any>>(
    `SELECT TOP (1)
       u.[id], u.[email], u.[password_hash],
       p.[full_name], p.[phone], p.[is_admin]
     FROM [dbo].[users] u
     LEFT JOIN [dbo].[profiles] p ON p.[id] = u.[id]
     WHERE LOWER(u.[email]) = LOWER(@email);`,
    { email },
  );
  return rows[0] ?? null;
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser();
  return user?.is_admin ? user : null;
}
