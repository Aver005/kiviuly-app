import { useCallback, useEffect, useRef, useState } from "react";
import type { Challenge } from "@shared/contract";

export interface PowProgress {
  attempts: number;
  hashrate: number;
  ms: number;
}

export interface PowSolution {
  nonce: string;
  attempts: number;
  ms: number;
  hash: string;
  bits: number;
}

/**
 * Runs the PoW solver in a Web Worker and exposes live progress for the UI.
 * One worker is spawned per `solve()` call and torn down when it settles.
 */
export function usePowSolver() {
  const [progress, setProgress] = useState<PowProgress | null>(null);
  const [solution, setSolution] = useState<PowSolution | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const cleanup = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setProgress(null);
    setSolution(null);
  }, [cleanup]);

  const solve = useCallback(
    (challenge: Challenge) =>
      new Promise<PowSolution>((resolve, reject) => {
        cleanup();
        setProgress({ attempts: 0, hashrate: 0, ms: 0 });
        setSolution(null);

        const worker = new Worker(new URL("../workers/pow.worker.ts", import.meta.url), {
          type: "module",
        });
        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent) => {
          const msg = e.data;
          if (msg.type === "progress") {
            setProgress({ attempts: msg.attempts, hashrate: msg.hashrate, ms: msg.ms });
          } else if (msg.type === "solved") {
            const sol: PowSolution = {
              nonce: msg.nonce,
              attempts: msg.attempts,
              ms: msg.ms,
              hash: msg.hash,
              bits: msg.bits,
            };
            setProgress({ attempts: msg.attempts, hashrate: msg.attempts / (msg.ms / 1000), ms: msg.ms });
            setSolution(sol);
            cleanup();
            resolve(sol);
          } else if (msg.type === "error") {
            cleanup();
            reject(new Error(msg.reason ?? "pow_failed"));
          }
        };

        worker.onerror = () => {
          cleanup();
          reject(new Error("worker_error"));
        };

        worker.postMessage({
          type: "solve",
          challenge: challenge.challenge,
          difficulty: challenge.difficulty,
        });
      }),
    [cleanup],
  );

  return { solve, progress, solution, reset };
}
