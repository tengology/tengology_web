"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useProductFocus } from "./ProductFocusContext";
import type { ProductChoice } from "@/lib/productOptions";

/**
 * One choice, then add to bag — the simple sibling of the birthstone picker.
 *
 * Nothing is preselected. A shopper who has not chosen a topping has not
 * chosen a product, and quietly defaulting to salmon would ship the wrong one.
 */
export function ProductChoicePicker({
  productId,
  title,
  price,
  inStock,
  choice,
}: {
  productId: string;
  title: string;
  price: number;
  inStock: boolean;
  choice: ProductChoice;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const focus = useProductFocus();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const chosen = choice.options.find((o) => o.value === picked) ?? null;

  // Put the chosen option in the big frame, the way the birthstone picker does.
  const setFocus = focus?.setFocus;
  useEffect(() => {
    if (!setFocus) return;
    setFocus({ url: chosen?.image ?? null, month: null });
  }, [chosen, setFocus]);

  function handleAdd() {
    if (!chosen) return;
    addItem({
      productId,
      title,
      price,
      image: chosen.image,
      personalisation: [{ label: choice.label, value: chosen.value }],
    });
    openCart();
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="eyebrow">Choose the {choice.label.toLowerCase()}</h3>
        {choice.hint && (
          <p className="mt-1 text-sm text-muted-foreground">{choice.hint}</p>
        )}
      </div>

      <fieldset
        className={`grid gap-2 ${
          choice.options.length > 2 ? "grid-cols-4" : "grid-cols-2"
        }`}
      >
        <legend className="sr-only">{choice.label}</legend>
        {choice.options.map((o) => {
          const selected = picked === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setPicked(o.value)}
              aria-pressed={selected}
              aria-label={o.note ? `${o.value} — ${o.note}` : o.value}
              className={`group text-left transition-opacity ${
                picked && !selected ? "opacity-70 hover:opacity-100" : ""
              }`}
            >
              <span
                className={`relative block aspect-square overflow-hidden border-2 bg-muted transition-colors ${
                  selected ? "border-foreground" : "border-transparent"
                }`}
              >
                <Image
                  src={o.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 30vw, 120px"
                  className="object-cover"
                />
              </span>
              <span
                className={`mt-1 block text-[11px] leading-tight ${
                  selected ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {o.value}
                {o.note && <span className="block opacity-70">{o.note}</span>}
              </span>
            </button>
          );
        })}
      </fieldset>

      <Button
        onClick={handleAdd}
        disabled={!inStock || !chosen}
        className="h-12 w-full text-xs uppercase tracking-[0.2em]"
        size="lg"
      >
        {!inStock ? (
          "Sold Out"
        ) : added ? (
          <span className="animate-in zoom-in-95 duration-200">Added &#10003;</span>
        ) : chosen ? (
          `Add ${chosen.value} to Bag`
        ) : (
          `Choose a ${choice.label.toLowerCase()}`
        )}
      </Button>
    </div>
  );
}
