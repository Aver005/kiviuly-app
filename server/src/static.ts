import { resolve, normalize, join } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const STATIC_DIR = resolve(
  process.env.STATIC_DIR ?? fileURLToPath(new URL("../../client/dist", import.meta.url)),
);

const INDEX = join(STATIC_DIR, "index.html");
export const hasStatic = existsSync(INDEX);

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

  // Request paths arrive raw. Scanners send NUL bytes (/etc/passwd%00.jpg),
  // which throw inside Bun.file, and broken escapes (/%ZZ), which throw inside
  // decodeURIComponent. Both used to surface as a 500 rather than a 404.
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;

  // Normalize and contain the path inside STATIC_DIR (block traversal).
  const safe = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  let target = resolve(STATIC_DIR, "." + (safe.startsWith("/") ? safe : "/" + safe));

  if (!target.startsWith(STATIC_DIR)) target = INDEX; // traversal attempt
  if (pathname === "/" || !existsSync(target)) target = INDEX;

  const file = Bun.file(target);
  if (!(await file.exists())) return null;

  // Content-Type comes from Bun.file itself. The hand-written table this
  // replaced matched Bun's answer on all nineteen types it listed, and would
  // have silently disagreed on the ones it missed (.wasm, .map).
  const headers = new Headers({
    "Cache-Control": cacheControl(pathname),
    "X-Content-Type-Options": "nosniff",
  });
  return new Response(file, { headers });
}
