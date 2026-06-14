import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** vertical travel in px */
  y?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  as?: "div" | "li" | "span";
}

/** Fade-and-rise a block into view on scroll. No-ops under reduced motion. */
export function Reveal({
  children,
  className,
  y = 26,
  delay = 0,
  duration = 0.85,
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-8% 0px -8% 0px" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
