import { NextResponse } from "next/server";
import { execute, query } from "@/lib/mssql";
import { requireAdmin } from "@/lib/local-auth";

export const runtime = "nodejs";

function fail(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const table = String(body.table ?? "");
    const operation = String(body.operation ?? "");
    const payload = (body.payload ?? {}) as Record<string, unknown>;
    const filters = Array.isArray(body.filters) ? body.filters : [];

    if (table === "newsletter_subscribers" && operation === "insert") {
      const email = String(payload.email ?? "").trim().toLowerCase();
      const source = String(payload.source ?? "footer").trim() || "footer";
      if (!email || !email.includes("@")) return fail("A valid email is required.");

      try {
        await execute(
          `IF NOT EXISTS (SELECT 1 FROM [dbo].[newsletter_subscribers] WHERE LOWER([email]) = LOWER(@email))
           BEGIN
             INSERT INTO [dbo].[newsletter_subscribers] ([email], [source]) VALUES (@email, @source);
           END`,
          { email, source },
        );
        return NextResponse.json({ data: null, error: null });
      } catch (error) {
        return fail(error instanceof Error ? error.message : "Subscription failed.", 500);
      }
    }

    if (table !== "site_assets") return fail("This client-side data operation is not allowed.", 403);
    if (!(await requireAdmin())) return fail("Administrator access required.", 401);

    if (operation === "upsert") {
      const key = String(payload.key ?? "");
      if (!key) return fail("Asset key is required.");
      const label = String(payload.label ?? key);
      const imageUrl = payload.image_url == null ? null : String(payload.image_url);
      const storagePath = payload.storage_path == null ? null : String(payload.storage_path);

      const rows = await query<Record<string, unknown>>(
        `MERGE [dbo].[site_assets] AS target
         USING (SELECT @key AS [key]) AS source
         ON target.[key] = source.[key]
         WHEN MATCHED THEN UPDATE SET
           [label] = @label,
           [image_url] = @image_url,
           [storage_path] = @storage_path,
           [updated_at] = SYSUTCDATETIME()
         WHEN NOT MATCHED THEN INSERT ([key], [label], [image_url], [storage_path])
           VALUES (@key, @label, @image_url, @storage_path)
         OUTPUT INSERTED.*;`,
        { key, label, image_url: imageUrl, storage_path: storagePath },
      );
      return NextResponse.json({ data: rows[0] ?? null, error: null });
    }

    if (operation === "update") {
      const keyFilter = filters.find((item: any) => item?.column === "key");
      const key = keyFilter ? String(keyFilter.value ?? "") : "";
      if (!key) return fail("Asset key filter is required.");

      const assignments: string[] = [];
      const params: Record<string, unknown> = { key };
      if (Object.prototype.hasOwnProperty.call(payload, "label")) {
        assignments.push("[label] = @label");
        params.label = payload.label == null ? null : String(payload.label);
      }
      if (Object.prototype.hasOwnProperty.call(payload, "image_url")) {
        assignments.push("[image_url] = @image_url");
        params.image_url = payload.image_url == null ? null : String(payload.image_url);
      }
      if (Object.prototype.hasOwnProperty.call(payload, "storage_path")) {
        assignments.push("[storage_path] = @storage_path");
        params.storage_path = payload.storage_path == null ? null : String(payload.storage_path);
      }
      assignments.push("[updated_at] = SYSUTCDATETIME()");

      await execute(
        `UPDATE [dbo].[site_assets] SET ${assignments.join(", ")} WHERE [key] = @key;`,
        params,
      );
      return NextResponse.json({ data: null, error: null });
    }

    return fail("Unsupported data operation.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Data operation failed.", 500);
  }
}
