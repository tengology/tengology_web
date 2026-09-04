"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import {
  BIRTHSTONES,
  birthstoneImageFor,
  birthstoneLabel,
  type Birthstone,
} from "@/lib/birthstones";
import { useProductFocus } from "./ProductFocusContext";

/**
 * Build a birthstone choker: a month's strand, then the initial that hangs
 * from it.
 *
 * Both halves are required, because both are made to order — the strand is
 * strung from that month's stone and the charm is the one the studio actually
 * threads on. Each combination is its own bag line, so three necklaces for
 * three bridesmaids stay three lines with three different strands and letters
 * all the way to the packing slip.
 */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** The same 18K gold alphabet assets the bead designer draws from. */
function charmSrc(letter: string) {
  return `/beads/gold-alphabet-${letter.toLowerCase()}.png`;
}

interface Props {
  productId: string;
  title: string;
  price: number;
  inStock: boolean;
}

export function InitialLetterPicker({ productId, title, price, inStock }: Props) {
  const [stone, setStone] = useState<Birthstone | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const focus = useProductFocus();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Point the gallery at whatever the current choices describe: the finished
   * piece where that strand and letter have been photographed together,
   * otherwise the strand on its own.
   */
  const setFocus = focus?.setFocus;
  useEffect(() => {
    if (!setFocus) return;
    setFocus(
      stone
        ? { url: birthstoneImageFor(stone, letter), month: stone.month }
        : { url: null, month: null }
    );
  }, [stone, letter, setFocus]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const ready = Boolean(stone && letter);

  function handleAdd() {
    if (!stone || !letter) return;
    addItem({
      productId,
      title,
      price,
      // The bag thumbnail shows the strand they picked, not the listing hero —
      // three lines for three bridesmaids should look like three necklaces.
      image: stone.image,
      personalisation: [
        { label: "Birthstone", value: birthstoneLabel(stone) },
        { label: "Initial", value: letter },
      ],
    });
    openCart();
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="space-y-8">
      {/* ── 1. the strand ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="eyebrow">
            <span className="text-muted-foreground">1.</span> Choose the birthstone
          </h3>
          {stone && (
            <span className="text-xs text-muted-foreground">{stone.meaning}</span>
          )}
        </div>

        <fieldset className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          <legend className="sr-only">Birthstone month</legend>
          {BIRTHSTONES.map((b) => {
            const selected = stone?.month === b.month;
            return (
              <button
                key={b.month}
                type="button"
                onClick={() => setStone(b)}
                aria-pressed={selected}
                aria-label={`${b.monthName} — ${b.stone}`}
                className={`group text-left transition-opacity ${
                  stone && !selected ? "opacity-70 hover:opacity-100" : ""
                }`}
              >
                <span
                  className={`relative block aspect-[3/4] overflow-hidden border-2 transition-colors ${
                    selected ? "border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: b.swatch }}
                >
                  <Image
                    src={b.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 30vw, 110px"
                    className="object-cover"
                  />
                </span>
                <span
                  className={`mt-1 block text-[11px] leading-tight ${
                    selected ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {b.monthName}
                </span>
              </button>
            );
          })}
        </fieldset>

        {stone && (
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground">{stone.monthName}</span> — {stone.stone}
          </p>
        )}
      </div>

      {/* ── 2. the initial ────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="eyebrow">
            <span className="text-muted-foreground">2.</span> Choose the initial
          </h3>
          {letter && (
            <span className="text-xs text-muted-foreground">
              Letter <span className="font-medium text-foreground">{letter}</span>
            </span>
          )}
        </div>

        <fieldset className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
          <legend className="sr-only">Initial letter</legend>
          {LETTERS.map((l) => {
            const selected = letter === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setLetter(l)}
                aria-pressed={selected}
                aria-label={`Initial ${l}`}
                className={`relative aspect-[3/4] rounded-sm border bg-muted/30 transition-colors ${
                  selected
                    ? "border-foreground bg-background"
                    : "border-transparent hover:border-muted-foreground/40"
                }`}
              >
                <Image
                  src={charmSrc(l)}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 16vw, 60px"
                  className="object-contain p-1.5"
                />
                <span className="sr-only">{l}</span>
              </button>
            );
          })}
        </fieldset>
      </div>

      {/* ── what they have built so far ───────────────────────────── */}
      {ready && (
        <p className="border-t pt-4 text-sm">
          <span className="text-muted-foreground">Your necklace: </span>
          {stone!.stone} strand with a gold{" "}
          <span className="font-medium">{letter}</span>
        </p>
      )}

      <div className="space-y-2">
        <Button
          onClick={handleAdd}
          disabled={!inStock || !ready}
          className="h-12 w-full text-xs uppercase tracking-[0.2em]"
          size="lg"
        >
          {!inStock ? (
            "Sold Out"
          ) : added ? (
            <span className="animate-in zoom-in-95 duration-200">Added &#10003;</span>
          ) : !stone ? (
            "Choose a birthstone"
          ) : !letter ? (
            "Choose an initial"
          ) : (
            `Add ${stone.stone} · ${letter} to Bag`
          )}
        </Button>
        {!ready && inStock && (
          <p className="text-xs text-muted-foreground">
            Both halves are made to order — pick a month and a letter. Ordering
            several? Each one is strung and boxed separately.
          </p>
        )}
      </div>
    </div>
  );
}
