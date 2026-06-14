import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env.DB_PATH ?? "./data/kiviuly.db";

// Make sure the parent directory exists (e.g. ./data or /data in Docker).
try {
  mkdirSync(dirname(DB_PATH), { recursive: true });
} catch {
  /* directory already exists */
}

export const db = new Database(DB_PATH, { create: true });

// Pragmas tuned for a small, write-light landing-page workload.
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA synchronous = NORMAL;");
db.exec("PRAGMA busy_timeout = 5000;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ref         TEXT    NOT NULL UNIQUE,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    company     TEXT,
    budget      TEXT,
    message     TEXT    NOT NULL,
    ip          TEXT,
    user_agent  TEXT,
    pow_bits    INTEGER NOT NULL DEFAULT 0,
    created_at  INTEGER NOT NULL
  );
`);

// Replay protection: every solved PoW signature can be spent exactly once.
db.exec(`
  CREATE TABLE IF NOT EXISTS pow_spent (
    signature TEXT PRIMARY KEY,
    expires   INTEGER NOT NULL
  );
`);

db.exec("CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at);");

export interface ContactRow {
  name: string;
  email: string;
  company: string | null;
  budget: string | null;
  message: string;
  ip: string | null;
  userAgent: string | null;
  powBits: number;
}

const insertStmt = db.query<{ id: number }, [string, string, string, string | null, string | null, string, string | null, string | null, number, number]>(
  `INSERT INTO contacts (ref, name, email, company, budget, message, ip, user_agent, pow_bits, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   RETURNING id`,
);

const countStmt = db.query<{ n: number }, []>("SELECT COUNT(*) AS n FROM contacts");

const markSpentStmt = db.query<unknown, [string, number]>(
  "INSERT INTO pow_spent (signature, expires) VALUES (?, ?)",
);
const isSpentStmt = db.query<{ signature: string }, [string]>(
  "SELECT signature FROM pow_spent WHERE signature = ?",
);
const pruneSpentStmt = db.query<unknown, [number]>(
  "DELETE FROM pow_spent WHERE expires < ?",
);

function makeRef(): string {
  // KIV-XXXXXX, Crockford-ish base32 without ambiguous chars.
  const alphabet = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `KIV-${out}`;
}

export function insertContact(row: ContactRow): { id: number; ref: string } {
  // Tiny retry loop in the (astronomically unlikely) event of a ref clash.
  for (let attempt = 0; attempt < 5; attempt++) {
    const ref = makeRef();
    try {
      const result = insertStmt.get(
        ref,
        row.name,
        row.email,
        row.company,
        row.budget,
        row.message,
        row.ip,
        row.userAgent,
        row.powBits,
        Date.now(),
      );
      return { id: result!.id, ref };
    } catch (err) {
      if (attempt === 4) throw err;
    }
  }
  throw new Error("could not allocate ref");
}

export function totalContacts(): number {
  return countStmt.get()?.n ?? 0;
}

export function isSignatureSpent(signature: string): boolean {
  return isSpentStmt.get(signature) != null;
}

export function spendSignature(signature: string, expires: number): boolean {
  pruneSpentStmt.run(Date.now());
  try {
    markSpentStmt.run(signature, expires);
    return true;
  } catch {
    // PRIMARY KEY conflict → already spent.
    return false;
  }
}
