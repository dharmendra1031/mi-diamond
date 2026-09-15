import { mkdir, unlink, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/local-auth";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;
const allowedBuckets = new Set(["products", "site-assets"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function fail(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

function safeRelativePath(value: string) {
  const normalized = value.replace(/\\/g, "/").replace(/^\/+/, "");
  const segments = normalized.split("/").filter(Boolean);
  if (!segments.length || segments.some((segment) => segment === "." || segment === "..")) {
    throw new Error("Invalid upload path.");
  }
  if (segments.some((segment) => !/^[a-zA-Z0-9._-]+$/.test(segment))) {
    throw new Error("Upload path contains unsupported characters.");
  }
  return segments.join("/");
}

function bucketRoot(bucket: string) {
  if (!allowedBuckets.has(bucket)) throw new Error("Unsupported upload bucket.");
  return path.join(process.cwd(), "public", "uploads", bucket);
}

function absolutePath(bucket: string, relative: string) {
  const root = bucketRoot(bucket);
  const full = path.resolve(root, ...relative.split("/"));
  const rootResolved = path.resolve(root) + path.sep;
  if (!(full + path.sep).startsWith(rootResolved) && full !== path.resolve(root)) {
    throw new Error("Invalid upload path.");
  }
  return full;
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Administrator access required.", 401);

    const form = await request.formData();
    const bucket = String(form.get("bucket") ?? "");
    const relative = safeRelativePath(String(form.get("path") ?? ""));
    const file = form.get("file");
    const upsert = String(form.get("upsert") ?? "0") === "1";

    if (!(file instanceof File)) return fail("Image file is required.");
    if (file.size <= 0 || file.size > MAX_BYTES) return fail("Image must be 12 MB or smaller.");

    const extension = path.extname(relative).toLowerCase();
    if (!allowedExtensions.has(extension)) return fail("Unsupported image extension.");
    if (file.type && file.type !== "application/octet-stream" && !file.type.startsWith("image/")) {
      return fail("Only image files are allowed.");
    }

    const full = absolutePath(bucket, relative);
    if (!upsert) {
      try {
        await access(full);
        return fail("A file already exists at this path.", 409);
      } catch {
        // File does not exist; continue.
      }
    }

    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, Buffer.from(await file.arrayBuffer()));

    const publicUrl = `/uploads/${encodeURIComponent(bucket)}/${relative
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;

    return NextResponse.json({ data: { path: relative, publicUrl }, error: null });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Upload failed.", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Administrator access required.", 401);

    const body = await request.json();
    const bucket = String(body.bucket ?? "");
    const paths = Array.isArray(body.paths) ? body.paths : [];

    for (const raw of paths) {
      const relative = safeRelativePath(String(raw));
      const full = absolutePath(bucket, relative);
      try {
        await unlink(full);
      } catch (error: any) {
        if (error?.code !== "ENOENT") throw error;
      }
    }

    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Delete failed.", 500);
  }
}
