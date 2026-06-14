interface SparkProps {
  size?: number;
  className?: string;
  spin?: boolean;
}

/** The Kiviuly four-point spark — recurring brand motif. */
export function Spark({ size = 24, className, spin = false }: SparkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`${spin ? "spin-slow" : ""} ${className ?? ""}`}
      style={{ transformOrigin: "center" }}
      aria-hidden
    >
      <path
        d="M32 4 C34.5 23 41 29.5 60 32 C41 34.5 34.5 41 32 60 C29.5 41 23 34.5 4 32 C23 29.5 29.5 23 32 4 Z"
        fill="currentColor"
      />
    </svg>
  );
}
