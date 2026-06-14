import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "ru" | "en";
export type CursorVariant = "default" | "link" | "view" | "text";

interface AppState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;

  /** Drives the custom cursor; kept here so any zone can nudge it. */
  cursor: CursorVariant;
  cursorLabel: string | null;
  setCursor: (v: CursorVariant, label?: string | null) => void;

  /** True once the menu / mobile overlay is open (locks scroll). */
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      locale: "ru",
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set((s) => ({ locale: s.locale === "ru" ? "en" : "ru" })),

      cursor: "default",
      cursorLabel: null,
      setCursor: (cursor, cursorLabel = null) => set({ cursor, cursorLabel }),

      menuOpen: false,
      setMenuOpen: (menuOpen) => set({ menuOpen }),
    }),
    {
      name: "kiviuly",
      partialize: (s) => ({ locale: s.locale }),
    },
  ),
);

/** Selector hook for the active locale (stable reference). */
export const useLocale = () => useApp((s) => s.locale);
