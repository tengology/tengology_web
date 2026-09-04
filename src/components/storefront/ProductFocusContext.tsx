"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Lets the options on a made-to-order product drive the gallery.
 *
 * Choosing September should put the September strand in the big frame, and
 * choosing an initial we have photographed on that strand should swap it again
 * for the finished piece. The picker names an image URL, the gallery finds it
 * among the shots it already has and selects it — nothing new is loaded, and a
 * URL the gallery does not hold is simply ignored.
 *
 * Both live in separate columns of a server-rendered page, so a context around
 * the pair is the least invasive way to join them.
 */

interface ProductFocus {
  /** The image the options currently point at, or null for "shopper's choice". */
  focusUrl: string | null;
  /**
   * The month the options have narrowed to. The gallery hides every shot of a
   * different stone, so choosing September leaves lapis lazuli and nothing else
   * to scroll through.
   */
  focusMonth: number | null;
  setFocus: (next: { url: string | null; month: number | null }) => void;
}

const Ctx = createContext<ProductFocus | null>(null);

export function ProductFocusProvider({ children }: { children: React.ReactNode }) {
  const [focusUrl, setUrl] = useState<string | null>(null);
  const [focusMonth, setMonth] = useState<number | null>(null);
  const setFocus = useCallback(
    (next: { url: string | null; month: number | null }) => {
      setUrl(next.url);
      setMonth(next.month);
    },
    []
  );
  const value = useMemo(
    () => ({ focusUrl, focusMonth, setFocus }),
    [focusUrl, focusMonth, setFocus]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Null outside a provider, so the gallery works on ordinary products too. */
export function useProductFocus(): ProductFocus | null {
  return useContext(Ctx);
}
