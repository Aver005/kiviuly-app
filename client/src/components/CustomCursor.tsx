import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "motion/react";
import { useApp } from "@/store/app";

/**
 * A bone-coloured ring + dot that trails the pointer and morphs over
 * interactive zones. Desktop only — touch devices keep their native behaviour.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const cursor = useApp((s) => s.cursor);
  const label = useApp((s) => s.cursorLabel);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { damping: 28, stiffness: 320, mass: 0.4 });
  const ringY = useSpring(y, { damping: 28, stiffness: 320, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.body.classList.add("has-custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  const isLink = cursor === "link";
  const isView = cursor === "view";
  const isText = cursor === "text";
  const ringSize = isView ? 92 : isLink ? 60 : isText ? 4 : 34;
  const ringHeight = isText ? 46 : ringSize;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
      {/* outer ring */}
      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center rounded-full border"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: ringSize,
          height: ringHeight,
          borderColor: isLink || isView ? "var(--color-ember)" : "rgba(236,231,218,0.4)",
          backgroundColor: isView ? "rgba(224,98,58,0.12)" : "rgba(236,231,218,0)",
          borderRadius: isText ? 2 : 999,
        }}
        transition={{ type: "spring", damping: 22, stiffness: 300, mass: 0.3 }}
      >
        <AnimatePresence>
          {isView && label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="font-mono text-[9px] tracking-[0.2em] text-bone uppercase"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* precise inner dot (hidden over links/views) */}
      <motion.div
        className="absolute top-0 left-0 rounded-full bg-bone"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: isLink || isView || isText ? 0 : 5, height: isLink || isView || isText ? 0 : 5 }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}
