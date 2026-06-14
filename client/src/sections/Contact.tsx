import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BUDGETS, contactSchema, type Budget, type ContactInput } from "@shared/contract";
import { fetchChallenge, postContact } from "@/lib/api";
import { useApp } from "@/store/app";
import { useT, fieldError } from "@/lib/i18n";
import { usePowSolver } from "@/hooks/usePowSolver";
import { useCursorZone } from "@/hooks/useCursorZone";
import { Reveal } from "@/components/Reveal";
import { RisingText } from "@/components/RisingText";
import { Field } from "@/components/Field";
import { Spark } from "@/components/Spark";

type Phase = "idle" | "fetching" | "solving" | "submitting";
type Form = { name: string; email: string; company: string; message: string };

const EMPTY: Form = { name: "", email: "", company: "", message: "" };

export function Contact() {
  const t = useT();
  const locale = useApp((s) => s.locale);
  const queryClient = useQueryClient();
  const solver = usePowSolver();

  const [form, setForm] = useState<Form>(EMPTY);
  const [budget, setBudget] = useState<Budget | undefined>();
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("idle");

  const set = (key: keyof Form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const mutation = useMutation({
    mutationFn: async (input: ContactInput) => {
      setPhase("fetching");
      const challenge = await fetchChallenge();
      setPhase("solving");
      const solution = await solver.solve(challenge);
      setPhase("submitting");
      const res = await postContact({
        ...input,
        hp,
        pow: { ...challenge, nonce: solution.nonce },
      });
      if (!res.data.ok) {
        const err = new Error(res.data.error) as Error & { code?: string; fields?: Record<string, string> };
        err.code = res.data.error;
        err.fields = res.data.fields;
        throw err;
      }
      return res.data;
    },
    onSuccess: () => {
      setPhase("idle");
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (err: Error & { fields?: Record<string, string> }) => {
      setPhase("idle");
      solver.reset();
      if (err.fields) {
        const mapped: Record<string, string> = {};
        for (const [field, code] of Object.entries(err.fields)) mapped[field] = fieldError(locale, field, code);
        setErrors(mapped);
      }
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mutation.isPending) return;
    const parsed = contactSchema.safeParse({ ...form, budget });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        if (!fe[field]) fe[field] = fieldError(locale, field, issue.message);
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  };

  const reset = () => {
    mutation.reset();
    solver.reset();
    setForm(EMPTY);
    setBudget(undefined);
    setErrors({});
    setPhase("idle");
  };

  const topError = mutation.isError ? errorMessage((mutation.error as { code?: string })?.code, t) : null;
  const success = mutation.isSuccess ? mutation.data : null;

  return (
    <section id="contact" className="relative border-t border-line">
      <div className="shell grid grid-cols-1 gap-16 py-24 md:py-36 lg:grid-cols-2 lg:gap-24">
        {/* left — invitation */}
        <div className="flex flex-col">
          <Reveal>
            <span className="kicker">{t.contact.kicker}</span>
          </Reveal>
          <h2 className="mt-6 display text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.86] text-bone">
            <RisingText lines={[t.contact.titleTop]} />
            <RisingText lines={[t.contact.titleBot]} className="text-ember" baseDelay={0.08} />
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-md text-pretty text-base leading-relaxed text-bone-dim md:text-lg">
              {t.contact.lead}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-12 flex items-center gap-3 text-bone-dim">
              <Spark size={14} className="text-ember" />
              <span className="font-mono text-xs tracking-wide">{t.footer.email}</span>
            </div>
          </Reveal>
        </div>

        {/* right — form / success */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {success ? (
              <SuccessPanel key="success" ref_={success.ref} email={form.email} onAgain={reset} t={t} />
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-7"
              >
                <Field label={t.contact.labels.name} name="name" value={form.name} onChange={set("name")} placeholder={t.contact.placeholders.name} error={errors.name} autoComplete="name" />
                <Field label={t.contact.labels.email} name="email" type="email" inputMode="email" value={form.email} onChange={set("email")} placeholder={t.contact.placeholders.email} error={errors.email} autoComplete="email" />
                <Field label={t.contact.labels.company} name="company" value={form.company} onChange={set("company")} placeholder={t.contact.placeholders.company} optional={t.contact.optional} error={errors.company} autoComplete="organization" />

                {/* budget chips */}
                <div>
                  <span className="mb-2.5 flex items-baseline justify-between">
                    <span className="font-mono text-[11px] tracking-[0.18em] text-bone-dim uppercase">{t.contact.labels.budget}</span>
                    <span className="font-mono text-[10px] tracking-wide text-bone-faint">{t.contact.optional}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map((b) => (
                      <BudgetChip key={b} label={t.contact.budgets[b]} active={budget === b} onClick={() => setBudget(budget === b ? undefined : b)} />
                    ))}
                  </div>
                </div>

                <Field label={t.contact.labels.message} name="message" value={form.message} onChange={set("message")} placeholder={t.contact.placeholders.message} error={errors.message} textarea rows={4} />

                {/* honeypot — offscreen, never seen by humans */}
                <div aria-hidden className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Website
                    <input tabIndex={-1} autoComplete="off" name="website" value={hp} onChange={(e) => setHp(e.target.value)} />
                  </label>
                </div>

                <AnimatePresence>
                  {(phase !== "idle" || mutation.isPending) && (
                    <PowConsole phase={phase} progress={solver.progress} solution={solver.solution} t={t} />
                  )}
                </AnimatePresence>

                {topError && (
                  <p className="font-mono text-xs tracking-wide text-ember">{topError}</p>
                )}

                <SubmitButton pending={mutation.isPending} phase={phase} t={t} />

                <p className="flex items-start gap-2 text-pretty text-[12px] leading-relaxed text-bone-faint">
                  <Spark size={11} className="mt-0.5 shrink-0 text-bone-faint" />
                  {t.contact.pow.hint}
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ---------- pieces ---------- */

function errorMessage(code: string | undefined, t: ReturnType<typeof useT>): string {
  if (!code) return t.contact.errors.network;
  if (code === "rate_limited") return t.contact.errors.rate_limited;
  if (code === "validation") return t.contact.errors.validation;
  if (code.startsWith("pow")) return t.contact.errors.pow;
  return t.contact.errors.network;
}

function BudgetChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const zone = useCursorZone("link");
  return (
    <button
      type="button"
      onClick={onClick}
      {...zone}
      className={`rounded-full border px-4 py-2 font-mono text-[11px] tracking-wide transition-colors duration-300 ${
        active ? "border-bone bg-bone text-ink" : "border-line text-bone-dim hover:border-bone/40 hover:text-bone"
      }`}
    >
      {label}
    </button>
  );
}

function SubmitButton({ pending, phase, t }: { pending: boolean; phase: Phase; t: ReturnType<typeof useT> }) {
  const zone = useCursorZone("link");
  const label = pending
    ? phase === "fetching"
      ? t.contact.pow.fetching
      : phase === "solving"
        ? t.contact.pow.solving
        : t.contact.pow.submitting
    : t.contact.submit;
  return (
    <button
      type="submit"
      disabled={pending}
      {...zone}
      className="group relative mt-1 inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-bone px-8 py-4 text-sm text-ink transition-colors duration-300 hover:bg-ember disabled:cursor-progress"
    >
      <span className="relative z-10">{label}</span>
      {!pending && (
        <svg width="14" height="14" viewBox="0 0 14 14" className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
          <path d="M1 7h11M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function PowConsole({
  phase,
  progress,
  solution,
  t,
}: {
  phase: Phase;
  progress: { attempts: number; hashrate: number; ms: number } | null;
  solution: { hash: string; bits: number; attempts: number; ms: number } | null;
  t: ReturnType<typeof useT>;
}) {
  const reduce = useReducedMotion();
  const label =
    phase === "fetching" ? t.contact.pow.fetching : phase === "submitting" ? t.contact.pow.submitting : t.contact.pow.solving;
  const zeros = solution ? (solution.hash.match(/^0*/)?.[0] ?? "") : "";
  const rest = solution ? solution.hash.slice(zeros.length) : "";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="rounded-xl border border-line bg-ink/60 p-4 font-mono text-[11px]">
        <div className="flex items-center justify-between text-bone-dim">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {!reduce && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-70" />}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
            </span>
            {solution && phase === "submitting" ? t.contact.pow.solved : label}
          </span>
          {progress && phase === "solving" && (
            <span className="tabular-nums text-bone-faint">
              {Math.round(progress.hashrate).toLocaleString("ru-RU")} {t.contact.pow.rate}
            </span>
          )}
        </div>

        {/* progress bar */}
        <div className="relative mt-3 h-1 w-full overflow-hidden rounded bg-ink-3">
          {solution ? (
            <div className="h-full w-full bg-ember" />
          ) : !reduce ? (
            <motion.div
              className="absolute top-0 h-full w-2/5 rounded bg-ember"
              animate={{ left: ["-40%", "100%"] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : (
            <div className="h-full w-1/3 bg-ember" />
          )}
        </div>

        {/* live counters */}
        {progress && phase === "solving" && !solution && (
          <div className="mt-3 flex justify-between tabular-nums text-bone-faint">
            <span>{progress.attempts.toLocaleString("ru-RU")} {t.contact.pow.attempts}</span>
            <span>{Math.round(progress.ms)} ms</span>
          </div>
        )}

        {/* solved hash reveal */}
        {solution && (
          <div className="mt-3 break-all leading-relaxed">
            <span className="text-ember">{zeros}</span>
            <span className="text-bone-faint">{rest}</span>
            <div className="mt-2 flex justify-between text-bone-faint">
              <span className="text-ember">{solution.bits} {t.contact.pow.bits}</span>
              <span>{solution.attempts.toLocaleString("ru-RU")} {t.contact.pow.attempts} · {Math.round(solution.ms)} ms</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SuccessPanel({ ref_, email, onAgain, t }: { ref_: string; email: string; onAgain: () => void; t: ReturnType<typeof useT> }) {
  const zone = useCursorZone("link");
  const body = t.contact.success.body.replace("{ref}", ref_).replace("{email}", email);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-96 flex-col items-start justify-center rounded-2xl border border-line bg-ink-2/50 p-10"
    >
      <Spark size={44} className="text-ember" spin />
      <h3 className="mt-8 display text-5xl text-bone">{t.contact.success.title}</h3>
      <p className="mt-4 max-w-sm text-pretty text-bone-dim">{body}</p>
      <button onClick={onAgain} {...zone} className="mt-8 font-mono text-xs tracking-[0.16em] text-bone underline-offset-4 hover:underline">
        {t.contact.success.again} ↺
      </button>
    </motion.div>
  );
}
