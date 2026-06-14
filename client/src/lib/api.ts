import {
  challengeSchema,
  type Challenge,
  type ContactRequest,
  type ContactResponse,
} from "@shared/contract";

export class NetworkError extends Error {}

/** Ask the server for a fresh, signed proof-of-work challenge. */
export async function fetchChallenge(signal?: AbortSignal): Promise<Challenge> {
  let res: Response;
  try {
    res = await fetch("/api/pow/challenge", { signal, headers: { Accept: "application/json" } });
  } catch {
    throw new NetworkError("network");
  }
  if (res.status === 429) throw new NetworkError("rate_limited");
  if (!res.ok) throw new NetworkError("network");
  return challengeSchema.parse(await res.json());
}

export interface PostResult {
  status: number;
  data: ContactResponse;
}

/** Submit the contact form together with the solved PoW. */
export async function postContact(body: ContactRequest): Promise<PostResult> {
  let res: Response;
  try {
    res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new NetworkError("network");
  }
  let data: ContactResponse;
  try {
    data = (await res.json()) as ContactResponse;
  } catch {
    throw new NetworkError("network");
  }
  return { status: res.status, data };
}

export interface Stats {
  ok: boolean;
  requests: number;
}

export async function fetchStats(signal?: AbortSignal): Promise<Stats> {
  const res = await fetch("/api/stats", { signal });
  if (!res.ok) throw new NetworkError("network");
  return (await res.json()) as Stats;
}
