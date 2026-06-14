import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  POW,
  challengePayload,
  leadingZeroBits,
  powPreimage,
  type Challenge,
  type Solution,
} from "../../shared/contract";

const SECRET = process.env.POW_SECRET ?? "kiviuly-dev-secret-change-me";
if (SECRET === "kiviuly-dev-secret-change-me") {
  console.warn(
    "[pow] POW_SECRET is using the insecure default — set POW_SECRET in production.",
  );
}

const DIFFICULTY = clamp(
  Number(process.env.POW_DIFFICULTY ?? POW.defaultDifficulty),
  POW.minDifficulty,
  POW.maxDifficulty,
);

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return POW.defaultDifficulty;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

/** Mint a fresh, signed challenge for the client to solve. */
export function createChallenge(): Challenge {
  const challenge = randomBytes(16).toString("hex");
  const expires = Date.now() + POW.ttlMs;
  const base = { v: POW.version, challenge, difficulty: DIFFICULTY, expires };
  return {
    ...base,
    signature: sign(challengePayload(base)),
    algorithm: "sha-256",
  };
}

export type VerifyResult =
  | { ok: true; bits: number }
  | { ok: false; reason: "signature" | "expired" | "insufficient" | "version" };

/** Verify a returned solution without trusting any client-supplied field. */
export function verifySolution(sol: Solution): VerifyResult {
  if (sol.v !== POW.version) return { ok: false, reason: "version" };

  const expected = sign(
    challengePayload({
      v: sol.v,
      challenge: sol.challenge,
      difficulty: sol.difficulty,
      expires: sol.expires,
    }),
  );
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(sol.signature, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature" };
  }

  if (Date.now() > sol.expires) return { ok: false, reason: "expired" };

  const digest = createHash("sha256")
    .update(powPreimage(sol.challenge, sol.nonce))
    .digest("hex");
  const bits = leadingZeroBits(digest);
  if (bits < sol.difficulty) return { ok: false, reason: "insufficient" };

  return { ok: true, bits };
}
