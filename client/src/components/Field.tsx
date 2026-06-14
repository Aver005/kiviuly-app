import type { ChangeEvent } from "react";
import { useCursorZone } from "@/hooks/useCursorZone";

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  optional?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
  autoComplete?: string;
  inputMode?: "text" | "email";
}

export function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  optional,
  error,
  textarea,
  rows = 4,
  autoComplete,
  inputMode,
}: FieldProps) {
  const zone = useCursorZone("text");
  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value);

  const base =
    "w-full bg-transparent py-3 text-bone placeholder:text-bone-faint outline-none transition-colors duration-300";
  const border = error
    ? "border-b border-acid"
    : "border-b border-line focus:border-bone";

  return (
    <label className="block" {...zone}>
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] tracking-[0.18em] text-bone-dim uppercase">{label}</span>
        {error ? (
          <span className="font-mono text-[10px] tracking-wide text-acid">{error}</span>
        ) : optional ? (
          <span className="font-mono text-[10px] tracking-wide text-bone-faint">{optional}</span>
        ) : null}
      </span>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={handle}
          placeholder={placeholder}
          rows={rows}
          autoComplete={autoComplete}
          className={`${base} ${border} resize-none`}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={handle}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={`${base} ${border}`}
        />
      )}
    </label>
  );
}
