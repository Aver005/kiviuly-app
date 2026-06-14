import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useT } from "@/lib/i18n";
import { scrollToId } from "@/lib/scroll";
import { RisingText } from "@/components/RisingText";
import { Button } from "@/components/Button";
import { Spark } from "@/components/Spark";

export function Hero() {
  const t = useT();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const sparkY = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-28 pb-10 md:pt-32"
    >
      {/* atmosphere */}
      <motion.div
        aria-hidden
        style={{ y: glowY }}
        className="pointer-events-none absolute -top-1/4 left-1/2 h-[80vh] w-[80vh] -translate-x-1/2 rounded-full opacity-50 blur-[120px]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(224,98,58,0.22),transparent_62%)]" />
      </motion.div>
      <motion.div aria-hidden style={{ y: sparkY }} className="pointer-events-none absolute -right-24 top-24 text-ink-3 md:-right-10">
        <Spark size={520} spin className="opacity-[0.5]" />
      </motion.div>

      {/* top: kicker + coordinates */}
      <div className="shell relative flex items-center justify-between">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="kicker flex items-center gap-2"
        >
          <Spark size={11} className="text-ember" />
          {t.hero.kicker}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 1 }}
          className="kicker hidden md:block"
        >
          {t.hero.coords}
        </motion.span>
      </div>

      {/* center: the headline */}
      <motion.div style={{ y: headlineY, opacity: fade }} className="shell relative">
        <h1 className="display text-bone">
          <RisingText
            trigger="load"
            baseDelay={0.15}
            lines={[t.hero.lineTop]}
            className="block text-[clamp(2.6rem,9.5vw,9rem)] leading-[0.9] text-bone-dim"
          />
          <RisingText
            trigger="load"
            baseDelay={0.28}
            lines={[t.hero.lineMid]}
            className="block pl-[6vw] text-[clamp(3.6rem,17vw,16rem)] leading-[0.82] text-ember md:pl-[12vw]"
          />
          <RisingText
            trigger="load"
            baseDelay={0.4}
            lines={[t.hero.lineBot]}
            className="block text-[clamp(3.6rem,17vw,16rem)] leading-[0.82]"
          />
        </h1>
      </motion.div>

      {/* bottom: lead + actions + scroll cue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="shell relative flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
      >
        <p className="max-w-md text-pretty text-base leading-relaxed text-bone-dim md:text-lg">
          {t.hero.lead}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => scrollToId("contact")}>{t.hero.ctaPrimary}</Button>
          <Button variant="ghost" onClick={() => scrollToId("services")}>
            {t.hero.ctaSecondary}
          </Button>
        </div>
      </motion.div>

      {/* scroll indicator */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1 }}
        className="pointer-events-none absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
      >
        <span className="vertical-rl font-mono text-[10px] tracking-[0.3em] text-bone-faint uppercase">
          {t.hero.scroll}
        </span>
        <div className="relative h-12 w-px overflow-hidden bg-line">
          {!reduce && (
            <motion.div
              className="absolute inset-x-0 top-0 h-1/2 bg-ember"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
      </motion.div>
    </section>
  );
}
