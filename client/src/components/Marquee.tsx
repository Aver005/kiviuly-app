import type { ReactNode } from "react";

interface MarqueeProps {
  items: ReactNode[];
  dir?: "left" | "right";
  /** seconds for one full loop */
  duration?: number;
  separator?: ReactNode;
  className?: string;
}

/**
 * Seamless infinite marquee. Renders the item list twice and slides the track
 * by exactly half its width; pauses on hover, freezes under reduced-motion.
 */
export function Marquee({ items, dir = "left", duration = 36, separator, className }: MarqueeProps) {
  const sep = separator ?? <Diamond />;
  const Row = ({ ariaHidden }: { ariaHidden?: boolean }) => (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 md:px-9">{item}</span>
          <span className="text-bone-faint">{sep}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`marquee overflow-hidden ${className ?? ""}`}>
      <div className="marquee-track" data-dir={dir} style={{ ["--marquee-dur" as string]: `${duration}s` }}>
        <Row />
        <Row ariaHidden />
      </div>
    </div>
  );
}

function Diamond() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" className="opacity-60">
      <path d="M5 0L10 5L5 10L0 5Z" fill="currentColor" />
    </svg>
  );
}
