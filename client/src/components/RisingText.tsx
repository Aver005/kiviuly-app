import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

interface RisingTextProps {
  /** Each entry becomes its own clipped line. */
  lines: string[];
  className?: string;
  lineClassName?: string;
  /** Animate on mount ("load") or when scrolled into view ("view"). */
  trigger?: "load" | "view";
  baseDelay?: number;
  stagger?: number;
}

/**
 * Editorial "lines sliding up from a mask" effect for big display headlines.
 * Uses the useInView hook (reliable even for lazy-mounted, already-in-view
 * sections) rather than whileInView variant labels.
 */
export function RisingText({
  lines,
  className,
  lineClassName,
  trigger = "view",
  baseDelay = 0,
  stagger = 0.09,
}: RisingTextProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const active = trigger === "load" ? true : inView;

  if (reduce) {
    return (
      <span ref={ref} className={className}>
        {lines.map((l, i) => (
          <span key={i} className={`block ${lineClassName ?? ""}`}>
            {l}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className={`block overflow-hidden ${lineClassName ?? ""}`}>
          <motion.span
            className="block"
            initial={{ y: "115%" }}
            animate={active ? { y: "0%" } : { y: "115%" }}
            transition={{ duration: 0.95, delay: baseDelay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
