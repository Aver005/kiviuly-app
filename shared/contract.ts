import { z } from "zod";

/**
 * Shared contract between the Bun server and the React client.
 * Single source of truth for validation + the proof-of-work protocol.
 */

export const POW = {
  /** Protocol version — bump to invalidate old challenges. */
  version: 1 as const,
  /** How long a freshly minted challenge stays valid. */
  ttlMs: 5 * 60_000,
  /** Default difficulty in leading zero *bits* of the SHA-256 digest. */
  defaultDifficulty: 17,
  /** Guard rails the server enforces on incoming difficulty values. */
  minDifficulty: 8,
  maxDifficulty: 28,
} as const;

/** A challenge handed to the client. The signature binds it to the server. */
export const challengeSchema = z.object({
  v: z.literal(POW.version),
  challenge: z.string().min(16).max(128),
  difficulty: z.number().int().min(POW.minDifficulty).max(POW.maxDifficulty),
  expires: z.number().int().positive(),
  signature: z.string().regex(/^[0-9a-f]{64}$/),
  algorithm: z.literal("sha-256"),
});
export type Challenge = z.infer<typeof challengeSchema>;

/** A solved challenge the client returns with the form. */
export const solutionSchema = challengeSchema.extend({
  nonce: z.string().min(1).max(64),
});
export type Solution = z.infer<typeof solutionSchema>;

export const BUDGETS = ["explore", "mvp", "product", "platform"] as const;
export type Budget = (typeof BUDGETS)[number];

/** The human-facing contact form payload. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "min").max(80, "max"),
  email: z.string().trim().toLowerCase().email("email").max(160, "max"),
  company: z
    .string()
    .trim()
    .max(120, "max")
    .optional()
    .or(z.literal("")),
  budget: z.enum(BUDGETS).optional(),
  message: z.string().trim().min(12, "min").max(2000, "max"),
});
export type ContactInput = z.infer<typeof contactSchema>;

/** Full request body: contact data + PoW solution + a honeypot. */
export const contactRequestSchema = contactSchema.extend({
  pow: solutionSchema,
  /** Hidden honeypot — real users never fill it; bots usually do. */
  hp: z.string().max(0).optional().default(""),
});
export type ContactRequest = z.infer<typeof contactRequestSchema>;

export type ContactResponse =
  | { ok: true; id: number; ref: string }
  | { ok: false; error: string; fields?: Record<string, string> };

/**
 * Count leading zero *bits* in a lowercase hex string.
 * Shared by the client solver and the server verifier so they always agree.
 */
export function leadingZeroBits(hex: string): number {
  let bits = 0;
  for (const ch of hex) {
    const nibble = parseInt(ch, 16);
    if (Number.isNaN(nibble)) break;
    if (nibble === 0) {
      bits += 4;
      continue;
    }
    // count leading zeros within this non-zero nibble (0..3)
    bits += Math.clz32(nibble) - 28;
    break;
  }
  return bits;
}

/** The exact string that gets hashed: `challenge:nonce`. */
export function powPreimage(challenge: string, nonce: string): string {
  return `${challenge}:${nonce}`;
}

/** The exact string the server HMAC-signs to make a challenge tamper-proof. */
export function challengePayload(c: {
  v: number;
  challenge: string;
  difficulty: number;
  expires: number;
}): string {
  return `${c.v}:${c.challenge}:${c.difficulty}:${c.expires}`;
}
