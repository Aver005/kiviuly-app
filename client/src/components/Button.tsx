import type { ReactNode } from "react";
import { Magnetic } from "./Magnetic";
import { useCursorZone } from "@/hooks/useCursorZone";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  magnetic?: boolean;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className,
  disabled,
  magnetic = true,
}: ButtonProps) {
  const zone = useCursorZone("link");

  const base =
    "group relative inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-sm tracking-wide transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none";
  const styles =
    variant === "primary"
      ? "bg-bone text-ink hover:bg-ember hover:text-ink"
      : "border border-line text-bone hover:border-bone hover:bg-bone/5";

  const btn = (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles}`} {...zone}>
      <span>{children}</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        className="transition-transform duration-300 ease-out group-hover:translate-x-1"
      >
        <path d="M1 7h11M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  return (
    <div className={className}>
      {magnetic ? <Magnetic strength={0.25}>{btn}</Magnetic> : btn}
    </div>
  );
}
