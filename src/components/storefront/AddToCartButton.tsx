"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useEffect, useRef, useState } from "react";

interface AddToCartButtonProps {
  productId: string;
  title: string;
  price: number;
  image?: string;
  inStock: boolean;
  variantName?: string;
  needsVariantSelection?: boolean;
}

export function AddToCartButton({
  productId,
  title,
  price,
  image,
  inStock,
  variantName,
  needsVariantSelection = false,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const blocked = !inStock || needsVariantSelection;

  const handleAdd = () => {
    if (blocked) return;
    addItem({ productId, title, price, image, variantName });
    openCart();
    setAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Button
      onClick={handleAdd}
      disabled={blocked}
      className="h-12 w-full rounded-none text-xs uppercase tracking-[0.2em]"
      size="lg"
    >
      {needsVariantSelection ? (
        "Choose an option"
      ) : !inStock ? (
        "Sold Out"
      ) : added ? (
        <span className="animate-in zoom-in-95 duration-200">Added ✓</span>
      ) : (
        "Add to Bag"
      )}
    </Button>
  );
}
