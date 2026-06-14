import { ZodError } from "zod";
import { contactRequestSchema, type ContactResponse } from "../../shared/contract";
import { createChallenge, verifySolution } from "./pow";
import {
  insertContact,
  isSignatureSpent,
  spendSignature,
  totalContacts,
} from "./db";
import { rateLimit } from "./ratelimit";
import { serveStatic, hasStatic } from "./static";

const PORT = Number(process.env.PORT ?? 5678);
const HOST = process.env.HOST ?? "0.0.0.0";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; "),
};

function json(data: unknown, status = 200, extra?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extra,
    },
  });
}

function clientIp(req: Request, server: Bun.Server<undefined>): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return server.requestIP(req)?.address ?? "0.0.0.0";
}

function zodFields(err: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

const server = Bun.serve({
  port: PORT,
  hostname: HOST,
  // Solving + posting should be quick; allow a little slack for slow phones.
  idleTimeout: 30,
  async fetch(req, server) {
    const url = new URL(req.url);
    const { pathname } = url;

    // ---- API ----------------------------------------------------------
    if (pathname.startsWith("/api/")) {
      const res = await handleApi(pathname, req, server);
      for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
      return res;
    }

    // ---- Static SPA ---------------------------------------------------
    if (req.method === "GET" || req.method === "HEAD") {
      const res = await serveStatic(pathname);
      if (res) {
        for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
        return res;
      }
      if (!hasStatic) {
        return new Response(
          "Kiviuly API is running. Build the client (bun run build) to serve the site.",
          { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } },
        );
      }
    }

    return new Response("Not found", { status: 404 });
  },
});

async function handleApi(
  pathname: string,
  req: Request,
  server: Bun.Server<undefined>,
): Promise<Response> {
  const ip = clientIp(req, server);

  if (pathname === "/api/health") {
    return json({ ok: true, service: "kiviuly", time: Date.now() });
  }

  if (pathname === "/api/stats" && req.method === "GET") {
    return json({ ok: true, requests: totalContacts() });
  }

  if (pathname === "/api/pow/challenge" && req.method === "GET") {
    const limit = rateLimit(`pow:${ip}`, 60, 60_000);
    if (!limit.allowed) {
      return json(
        { ok: false, error: "rate_limited" },
        429,
        { "Retry-After": String(limit.retryAfter) },
      );
    }
    return json(createChallenge(), 200, { "Cache-Control": "no-store" });
  }

  if (pathname === "/api/contact" && req.method === "POST") {
    return handleContact(req, ip);
  }

  return json({ ok: false, error: "not_found" }, 404);
}

async function handleContact(req: Request, ip: string): Promise<Response> {
  const limit = rateLimit(`contact:${ip}`, 5, 5 * 60_000);
  if (!limit.allowed) {
    const body: ContactResponse = { ok: false, error: "rate_limited" };
    return json(body, 429, { "Retry-After": String(limit.retryAfter) });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ ok: false, error: "bad_json" } satisfies ContactResponse, 400);
  }

  // Honeypot: silently accept-and-drop so bots think they succeeded.
  if (
    raw &&
    typeof raw === "object" &&
    typeof (raw as Record<string, unknown>).hp === "string" &&
    ((raw as Record<string, unknown>).hp as string).length > 0
  ) {
    return json({ ok: true, id: 0, ref: "KIV-RECEIVED" } satisfies ContactResponse);
  }

  const parsed = contactRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return json(
      { ok: false, error: "validation", fields: zodFields(parsed.error) } satisfies ContactResponse,
      400,
    );
  }

  const { pow, name, email, company, budget, message } = parsed.data;

  const verdict = verifySolution(pow);
  if (!verdict.ok) {
    const error =
      verdict.reason === "expired"
        ? "pow_expired"
        : verdict.reason === "insufficient"
          ? "pow_insufficient"
          : "pow_invalid";
    return json({ ok: false, error } satisfies ContactResponse, 400);
  }

  // One-time use: a solved challenge can't be replayed.
  if (isSignatureSpent(pow.signature) || !spendSignature(pow.signature, pow.expires)) {
    return json({ ok: false, error: "pow_replay" } satisfies ContactResponse, 409);
  }

  try {
    const { id, ref } = insertContact({
      name,
      email,
      company: company && company.length > 0 ? company : null,
      budget: budget ?? null,
      message,
      ip,
      userAgent: req.headers.get("user-agent"),
      powBits: verdict.bits,
    });
    console.log(`[contact] ${ref} from ${email} (${verdict.bits} bits) ip=${ip}`);
    return json({ ok: true, id, ref } satisfies ContactResponse, 201);
  } catch (err) {
    console.error("[contact] insert failed", err);
    return json({ ok: false, error: "server_error" } satisfies ContactResponse, 500);
  }
}

console.log(
  `▲ Kiviuly server on http://${HOST}:${server.port}  (static: ${hasStatic ? "on" : "off"})`,
);
