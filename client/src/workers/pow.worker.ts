/// <reference lib="webworker" />
import { sha256ascii, wordsToHex } from "@/lib/sha256";

/**
 * Proof-of-work solver. Grinds nonces until SHA-256(`challenge:nonce`) has at
 * least `difficulty` leading zero bits, reporting progress as it goes.
 *
 * Leading-zero-bits of the full digest equals clz32 of the first 32-bit word
 * for any difficulty < 32, so we only inspect word[0] in the hot loop.
 */

interface SolveRequest {
  type: "solve";
  challenge: string;
  difficulty: number;
}

type Outbound =
  | { type: "progress"; attempts: number; hashrate: number; ms: number }
  | { type: "solved"; nonce: string; attempts: number; ms: number; hash: string; bits: number }
  | { type: "error"; reason: string };

const REPORT_MASK = 0x1fff; // report every 8192 attempts
const SAFETY_CAP = 1 << 25; // ~33.5M — astronomically above expected work

self.onmessage = (event: MessageEvent<SolveRequest>) => {
  const { challenge, difficulty } = event.data;
  if (event.data.type !== "solve") return;

  const start = performance.now();
  let nonce = 0;

  for (; nonce < SAFETY_CAP; nonce++) {
    const word0 = sha256ascii(`${challenge}:${nonce}`)[0];
    if (Math.clz32(word0) >= difficulty) {
      const ms = performance.now() - start;
      const hash = wordsToHex(sha256ascii(`${challenge}:${nonce}`));
      post({
        type: "solved",
        nonce: String(nonce),
        attempts: nonce + 1,
        ms,
        hash,
        bits: Math.clz32(word0),
      });
      return;
    }

    if ((nonce & REPORT_MASK) === 0 && nonce > 0) {
      const ms = performance.now() - start;
      post({ type: "progress", attempts: nonce, hashrate: nonce / (ms / 1000), ms });
    }
  }

  post({ type: "error", reason: "exhausted" });
};

function post(msg: Outbound) {
  (self as DedicatedWorkerGlobalScope).postMessage(msg);
}
