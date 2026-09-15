import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedBuckets = new Set(["products", "site-assets"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

function safeSegments(values: string[]) {
  if (!values.length) throw new Error("Invalid media path.");
  const decoded = values.map((value) => decodeURIComponent(value));
  if (decoded.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("Invalid media path.");
  }
  if (decoded.some((segment) => !/^[a-zA-Z0-9._-]+$/.test(segment))) {
    throw new Error("Media path contains unsupported characters.");
  }
  return decoded;
}

function resolveMediaPath(values: string[]) {
  const segments = safeSegments(values);
  const [bucket, ...relative] = segments;
  if (!allowedBuckets.has(bucket) || !relative.length) {
    throw new Error("Unsupported media path.");
  }

  const extension = path.extname(relative[relative.length - 1]).toLowerCase();
  if (!allowedExtensions.has(extension)) throw new Error("Unsupported media type.");

  const root = path.resolve(process.cwd(), "public", "uploads", bucket);
  const full = path.resolve(root, ...relative);
  if (!full.startsWith(root + path.sep)) throw new Error("Invalid media path.");

  return { full, extension };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const params = await context.params;
    const { full, extension } = resolveMediaPath(params.path ?? []);
    const file = await readFile(full);

    return new Response(file, {
      status: 200,
      headers: {
        "Content-Type": contentTypes[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error: any) {
    if (error?.code === "ENOENT") return new Response("Not found", { status: 404 });
    return new Response("Not found", { status: 404 });
  }
}
