import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { useApp } from "@/store/app";
import { scrollToId } from "@/lib/scroll";
import { Reveal } from "@/components/Reveal";
import { RisingText } from "@/components/RisingText";
import { Spark } from "@/components/Spark";
import { useCursorZone } from "@/hooks/useCursorZone";

export function Footer() {
  const t = useT();
  const linkZone = useCursorZone("link");
  const setLocale = useApp((s) => s.setLocale);

  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink">
      <div className="shell py-20 md:py-28">
        {/* top row */}
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <Reveal>
            <div className="flex items-center gap-3">
              <Spark size={20} className="text-acid" spin />
              <p className="max-w-xs text-pretty text-lg leading-snug text-bone">{t.footer.tagline}</p>
            </div>
          </Reveal>

          {/* columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol title={t.footer.nav}>
              {t.nav.links.map((l) => (
                <button key={l.id} onClick={() => scrollToId(l.id)} className="footer-link" {...linkZone}>
                  {l.label}
                </button>
              ))}
            </FooterCol>
            <FooterCol title={t.footer.contacts}>
              <a href={`mailto:${t.footer.email}`} className="footer-link" {...linkZone}>
                {t.footer.email}
              </a>
              <button onClick={() => scrollToId("contact")} className="footer-link" {...linkZone}>
                {t.nav.cta}
              </button>
            </FooterCol>
            <FooterCol title={t.footer.social}>
              <button onClick={() => setLocale("ru")} className="footer-link" {...linkZone}>
                Русский
              </button>
              <button onClick={() => setLocale("en")} className="footer-link" {...linkZone}>
                English
              </button>
            </FooterCol>
          </div>
        </div>

        {/* giant wordmark */}
        <div className="mt-20 md:mt-28">
          <RisingText
            lines={[t.footer.word]}
            className="block display text-outline text-[clamp(3.5rem,21vw,18rem)] leading-[0.8]"
          />
        </div>

        {/* baseline */}
        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-6 md:flex-row md:items-center">
          <span className="font-mono text-[11px] tracking-wide text-bone-faint">{t.footer.copyright}</span>
          <button
            onClick={() => scrollToId("top")}
            className="group flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-bone-dim uppercase transition-colors hover:text-bone"
            {...linkZone}
          >
            {t.footer.back}
            <svg width="12" height="12" viewBox="0 0 12 12" className="transition-transform duration-300 group-hover:-translate-y-0.5">
              <path d="M6 11V1M2 5l4-4 4 4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] tracking-[0.22em] text-bone-faint uppercase">{title}</span>
      {children}
    </div>
  );
}
