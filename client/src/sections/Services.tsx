import { useT } from "@/lib/i18n";
import { Reveal } from "@/components/Reveal";
import { useCursorZone } from "@/hooks/useCursorZone";

export function Services() {
  const t = useT();

  return (
    <section id="services" className="relative border-t border-line">
      <div className="shell py-24 md:py-36">
        {/* header */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:mb-24 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <span className="kicker">{t.services.kicker}</span>
          </Reveal>
          <Reveal className="md:col-span-9" delay={0.05}>
            <h2 className="max-w-3xl text-pretty text-[clamp(1.5rem,3.6vw,2.9rem)] leading-[1.15] tracking-tight text-bone">
              {t.services.title}
            </h2>
          </Reveal>
        </div>

        {/* list */}
        <ul>
          {t.services.items.map((item, i) => (
            <ServiceRow key={i} item={item} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ServiceRow({
  item,
  index,
}: {
  item: { n: string; title: string; desc: string; tags: readonly string[] };
  index: number;
}) {
  const zone = useCursorZone("view", "↘");
  return (
    <Reveal delay={index * 0.06}>
      <li
        className="group grid grid-cols-12 items-start gap-x-4 gap-y-4 border-t border-line py-9 transition-colors duration-500 last:border-b hover:border-bone/30 md:py-12"
        {...zone}
      >
        <span className="col-span-2 font-mono text-xs text-bone-faint md:col-span-1">{item.n}</span>

        <h3 className="col-span-11 display hyphens-auto text-[clamp(1.5rem,4.2vw,3.5rem)] leading-[0.95] text-bone transition-all duration-500 group-hover:translate-x-2 group-hover:text-acid md:col-span-6">
          {item.title}
        </h3>

        <div className="col-span-12 md:col-span-4 md:col-start-8">
          <p className="max-w-sm text-pretty text-bone-dim">{item.desc}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-3 py-1 font-mono text-[11px] tracking-wide text-bone-dim transition-colors duration-500 group-hover:border-bone/40 group-hover:text-bone"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <span className="col-span-12 hidden items-start justify-end text-bone-faint transition-all duration-500 group-hover:text-acid md:col-span-1 md:flex">
          <svg width="22" height="22" viewBox="0 0 24 24" className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
            <path d="M5 19L19 5M19 5H8M19 5v11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </li>
    </Reveal>
  );
}
