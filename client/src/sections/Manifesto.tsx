import { motion, useReducedMotion } from "motion/react";
import { useT } from "@/lib/i18n";
import { Reveal } from "@/components/Reveal";
import { Spark } from "@/components/Spark";

export function Manifesto() {
  const t = useT();
  const reduce = useReducedMotion();

  return (
    <section id="manifest" className="relative border-t border-line">
      <div className="shell py-28 md:py-44">
        {/* kicker + animated hairline */}
        <div className="mb-14 flex items-center gap-5 md:mb-20">
          <span className="kicker whitespace-nowrap">{t.manifesto.kicker}</span>
          <motion.div
            className="rule flex-1"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0 }}
          />
          <Spark size={14} className="text-bone-faint" spin={!reduce} />
        </div>

        {/* the pull-quote */}
        <Reveal>
          <p className="max-w-[64rem] text-pretty text-[clamp(1.75rem,4.6vw,4.25rem)] leading-[1.12] tracking-tight text-bone">
            {t.manifesto.quoteLead}{" "}
            <span className="font-display text-[1.18em] leading-[0.8] text-acid align-baseline">
              {t.manifesto.quoteAccent}
            </span>{" "}
            {t.manifesto.quoteTail}
          </p>
        </Reveal>

        {/* supporting body, offset right for asymmetry */}
        <Reveal delay={0.1}>
          <p className="mt-16 ml-auto max-w-xl text-pretty text-base leading-relaxed text-bone-dim md:mt-24 md:text-lg">
            {t.manifesto.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
