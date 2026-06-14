import { useMemo } from "react";
import { useApp, type CursorVariant } from "@/store/app";

/**
 * Returns mouse handlers that morph the custom cursor while hovering a zone,
 * then restore it on leave. Spread onto any interactive element.
 */
export function useCursorZone(variant: CursorVariant, label?: string) {
  const setCursor = useApp((s) => s.setCursor);
  return useMemo(
    () => ({
      onMouseEnter: () => setCursor(variant, label ?? null),
      onMouseLeave: () => setCursor("default"),
    }),
    [setCursor, variant, label],
  );
}
