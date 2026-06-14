import { resolve, normalize, extname, join } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const STATIC_DIR = resolve(
  process.env.STATIC_DIR ?? fileURLToPath(new URL("../../client/dist", import.meta.url)),
);

const INDEX = join(STATIC_DIR, "index.html");
export const hasStatic = existsSync(INDEX);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml",
};

function cacheControl(pathname: string): string {
  // Vite emits content-hashed files under /assets — cache them forever.
  if (pathname.startsWith("/assets/")) return "public, max-age=31536000, immutable";
  if (/\.(woff2?|otf|ttf)$/.test(pathname)) return "public, max-age=31536000, immutable";
  if (pathname === "/" || pathname.endsWith(".html")) return "no-cache";
  return "public, max-age=3600";
}

/**
 * Serve a static asset for GET requests, falling back to index.html so the
 * SPA can handle client-side routing. Returns null if there is no build.
 */
export async function serveStatic(pathname: string): Promise<Response | null> {
  if (!hasStatic) return null;

  // Normalize and contain the path inside STATIC_DIR (block traversal).
  const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  let target = resolve(STATIC_DIR, "." + (safe.startsWith("/") ? safe : "/" + safe));

  if (!target.startsWith(STATIC_DIR)) target = INDEX; // traversal attempt
  if (pathname === "/" || !existsSync(target)) target = INDEX;

  const file = Bun.file(target);
  if (!(await file.exists())) return null;

  const ext = extname(target).toLowerCase();
  const headers = new Headers({
    "Content-Type": TYPES[ext] ?? "application/octet-stream",
    "Cache-Control": cacheControl(pathname),
    "X-Content-Type-Options": "nosniff",
  });
  return new Response(file, { headers });
}
