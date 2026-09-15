import { NextResponse } from "next/server";
import { execute, query } from "@/lib/mssql";
import {
  createSession,
  destroySession,
  getAuthenticatedUser,
  getUserByEmail,
  hashPassword,
  verifyPassword,
} from "@/lib/local-auth";

export const runtime = "nodejs";

function fail(message: string, status = 400) {
  return NextResponse.json({ error: { message } }, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "login") {
      const email = String(body.email ?? "").trim();
      const password = String(body.password ?? "");
      if (!email || !password) return fail("Email and password are required.");

      const user = await getUserByEmail(email);
      if (!user || !verifyPassword(password, String(user.password_hash))) {
        return fail("Email or password is incorrect.", 401);
      }

      await createSession(String(user.id));
      return NextResponse.json({
        data: {
          user: { id: String(user.id), email: String(user.email) },
          session: true,
        },
        error: null,
      });
    }

    if (action === "register") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      const fullName = String(body.full_name ?? "").trim() || null;
      const phone = String(body.phone ?? "").trim() || null;

      if (!email || !email.includes("@")) return fail("A valid email is required.");
      if (password.length < 6) return fail("Password must be at least 6 characters.");
      if (await getUserByEmail(email)) return fail("An account already exists with this email.");

      const passwordHash = hashPassword(password);
      const rows = await query<{ id: string }>(
        `DECLARE @id uniqueidentifier = NEWID();
         INSERT INTO [dbo].[users] ([id], [email], [password_hash])
         VALUES (@id, @email, @password_hash);
         INSERT INTO [dbo].[profiles] ([id], [full_name], [phone], [is_admin])
         VALUES (@id, @full_name, @phone, 0);
         SELECT @id AS [id];`,
        { email, password_hash: passwordHash, full_name: fullName, phone },
      );
      const id = String(rows[0].id);
      await createSession(id);
      return NextResponse.json({ data: { user: { id, email }, session: true }, error: null });
    }

    if (action === "logout") {
      await destroySession();
      return NextResponse.json({ error: null });
    }

    if (action === "update-password") {
      const user = await getAuthenticatedUser();
      if (!user) return fail("You are not signed in.", 401);
      const password = String(body.password ?? "");
      if (password.length < 6) return fail("Password must be at least 6 characters.");
      await execute(
        `UPDATE [dbo].[users]
         SET [password_hash] = @password_hash, [updated_at] = SYSUTCDATETIME()
         WHERE [id] = @id;`,
        { id: user.id, password_hash: hashPassword(password) },
      );
      return NextResponse.json({ data: { user: { id: user.id, email: user.email } }, error: null });
    }

    if (action === "forgot-password") {
      return NextResponse.json({
        error: { message: "Password reset email is disabled on this catalogue. Contact the administrator to reset the password." },
      }, { status: 501 });
    }

    return fail("Unsupported authentication action.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Authentication failed.", 500);
  }
}
