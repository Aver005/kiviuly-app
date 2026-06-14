import { useQuery } from "@tanstack/react-query";
import { useT } from "@/lib/i18n";
import { fetchStats } from "@/lib/api";
import { Reveal } from "@/components/Reveal";
import { Marquee } from "@/components/Marquee";
import { CountUp } from "@/components/CountUp";

export function Capabilities() {
  const t = useT();
  const { data } = useQuery({ queryKey: ["stats"], queryFn: ({ signal }) => fetchStats(signal) });
  const liveRequests = data?.requests ?? 0;

  const filled = t.capabilities.stack.map((s) => (
    <span className="display text-[clamp(2.5rem,7vw,6rem)] leading-none text-bone">{s}</span>
  ));
  const outlined = t.capabilities.stack.map((s) => (
    <span className="display text-outline text-[clamp(2.5rem,7vw,6rem)] leading-none">{s}</span>
  ));

  return (
    <section id="capabilities" className="relative overflow-hidden border-t border-line py-24 md:py-36">
      <div className="shell">
        <Reveal>
          <span className="kicker">{t.capabilities.kicker}</span>
          <h2 className="mt-5 max-w-2xl text-[clamp(1.4rem,3.4vw,2.6rem)] leading-tight tracking-tight text-bone">
            {t.capabilities.title}
          </h2>
        </Reveal>
      </div>

      {/* dual marquee of the stack */}
      <div className="my-16 flex flex-col gap-3 text-bone md:my-24 md:gap-5">
        <Marquee items={filled} dir="left" duration={42} />
        <Marquee items={outlined} dir="right" duration={52} />
      </div>

      {/* stats */}
      <div className="shell grid grid-cols-1 gap-px sm:grid-cols-3">
        {t.capabilities.stats.map((stat, i) => {
          const isLive = stat.value === null;
          return (
            <Reveal key={i} delay={i * 0.1}>
              <div className="flex h-full flex-col border-t border-line pt-7">
                <span className="font-display text-[clamp(3rem,8vw,6rem)] leading-none text-acid">
                  {isLive ? <CountUp value={liveRequests} /> : stat.value}
                </span>
                <span className="mt-4 max-w-[16rem] text-sm leading-relaxed text-bone-dim">{stat.label}</span>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
