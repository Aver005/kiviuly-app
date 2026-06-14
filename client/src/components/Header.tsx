import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useApp } from "@/store/app";
import { useT } from "@/lib/i18n";
import { scrollToId } from "@/lib/scroll";
import { useCursorZone } from "@/hooks/useCursorZone";
import { Spark } from "./Spark";

export function Header() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const menuOpen = useApp((s) => s.menuOpen);
  const setMenuOpen = useApp((s) => s.setMenuOpen);
  const toggleLocale = useApp((s) => s.toggleLocale);
  const linkZone = useCursorZone("link");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const go = (id: string) => {
    setMenuOpen(false);
    // let the overlay close before scrolling
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "backdrop-blur-md bg-ink/70 border-b border-line" : "border-b border-transparent"
        }`}
      >
        <div className={`shell flex items-center justify-between transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
          {/* brand */}
          <button
            onClick={() => go("top")}
            className="group flex items-center gap-2.5 text-bone"
            {...linkZone}
            aria-label="Kiviuly — наверх"
          >
            <Spark size={18} className="text-acid transition-transform duration-700 group-hover:rotate-180" />
            <span className="font-mono text-sm tracking-[0.32em]">{t.nav.brand}</span>
          </button>

          {/* desktop nav */}
          <nav className="hidden items-center gap-9 md:flex">
            {t.nav.links.map((l, i) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="group relative font-mono text-xs tracking-[0.16em] text-bone-dim transition-colors hover:text-bone"
                {...linkZone}
              >
                <span className="mr-1.5 text-bone-faint">0{i + 1}</span>
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-acid transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* right cluster */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLocale}
              className="font-mono text-xs tracking-[0.2em] text-bone-dim transition-colors hover:text-bone"
              {...linkZone}
              aria-label="Switch language"
            >
              {t.nav.langLabel}
            </button>

            <button
              onClick={() => go("contact")}
              className="hidden rounded-full border border-line px-5 py-2 font-mono text-xs tracking-[0.14em] text-bone transition-colors hover:border-bone hover:bg-bone/5 md:inline-flex"
              {...linkZone}
            >
              {t.nav.cta}
            </button>

            {/* mobile burger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 items-center justify-center md:hidden"
              aria-label="Menu"
            >
              <div className="relative h-3.5 w-6">
                <span
                  className={`absolute left-0 h-px w-full bg-bone transition-all duration-300 ${menuOpen ? "top-1.5 rotate-45" : "top-0"}`}
                />
                <span
                  className={`absolute left-0 bottom-0 h-px w-full bg-bone transition-all duration-300 ${menuOpen ? "bottom-2 -rotate-45" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-ink/95 px-8 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {t.nav.links.map((l, i) => (
                <motion.button
                  key={l.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.1, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => go(l.id)}
                  className="flex items-baseline gap-4 py-2 text-left"
                >
                  <span className="font-mono text-xs text-bone-faint">0{i + 1}</span>
                  <span className="display text-5xl text-bone">{l.label}</span>
                </motion.button>
              ))}
            </nav>
            <button
              onClick={() => go("contact")}
              className="mt-10 inline-flex w-fit rounded-full bg-bone px-7 py-3.5 text-sm text-ink"
            >
              {t.nav.cta}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
