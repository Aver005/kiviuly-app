import { useT } from "@/lib/i18n";
import { Reveal } from "@/components/Reveal";
import { Spark } from "@/components/Spark";

export function Process() {
  const t = useT();

  return (
    <section id="process" className="relative border-t border-line bg-ink-2/40">
      <div className="shell py-24 md:py-36">
        <div className="mb-16 flex flex-col gap-6 md:mb-24 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <span className="kicker">{t.process.kicker}</span>
            <h2 className="mt-5 max-w-2xl display text-[clamp(2.2rem,6vw,4.5rem)] leading-[0.95] text-bone">
              {t.process.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Spark size={40} className="text-acid" spin />
          </Reveal>
        </div>

        <ol className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
          {t.process.steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08}>
              <li className="group relative flex h-full flex-col border-t border-line pt-7">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[clamp(3rem,7vw,4.5rem)] leading-none text-bone transition-colors duration-500 group-hover:text-acid">
                    {step.n}
                  </span>
                  <span className="mb-2 h-1.5 w-1.5 rounded-full bg-bone-faint transition-colors duration-500 group-hover:bg-acid" />
                </div>
                <h3 className="mt-6 text-xl tracking-tight text-bone">{step.title}</h3>
                <p className="mt-3 max-w-[22rem] text-pretty text-sm leading-relaxed text-bone-dim">
                  {step.desc}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
