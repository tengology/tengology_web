import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  /**
   * Bespoke jewellery designed in the studio. Every design is unique, so these
   * lines carry their own `lineId` and are never merged with each other — two
   * bracelets from the same designer are two different products.
   */
  design?: {
    kind: string;
    /** Share code — round-trips the full design through `tryDecodeDesign`. */
    encoded: string;
    beadCount: number;
  };
  /**
   * The made-to-order choices on an otherwise catalogue product — the strand
   * and the initial on a birthstone choker, say. Two different combinations of
   * the same product are two lines, not one line of two, so the studio knows
   * exactly what to string for each.
   */
  personalisation?: {
    /** Shown against the line in the bag, e.g. "Initial". */
    label: string;
    /** The chosen value, e.g. "K". Travels through to the packing slip. */
    value: string;
  }[];
}

/**
 * Cart lines are keyed by whatever makes them distinct: a bespoke design's
 * share code, then a personalisation choice, and otherwise the product itself.
 */
export function cartLineKey(
  item: Pick<CartItem, "productId" | "design" | "personalisation">
): string {
  if (item.design) return `design:${item.design.encoded}`;
  if (item.personalisation?.length) {
    return `${item.productId}:${item.personalisation.map((p) => p.value).join("/")}`;
  }
  return item.productId;
}

/** What the server is sent: ids, quantities and made-to-order choices only. */
export interface OrderLineInput {
  productId: string;
  quantity: number;
  personalisation?: string;
}

/**
 * Collapse the bag into the lines the server prices.
 *
 * Lines are merged on `cartLineKey`, not on product id: two initials of the
 * same pendant have to stay apart all the way to the packing slip. `priceCart`
 * spends a product's stock across the whole basket, so several lines drawing on
 * one product still can't oversell it.
 */
export function buildOrderLines(items: CartItem[]): OrderLineInput[] {
  const byLine = new Map<string, OrderLineInput>();
  for (const item of items) {
    const key = cartLineKey(item);
    const existing = byLine.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      byLine.set(key, {
        productId: item.productId,
        quantity: item.quantity,
        ...(item.personalisation?.length
          ? {
              personalisation: item.personalisation
                .map((p) => `${p.label} ${p.value}`)
                .join(", "),
            }
          : {}),
      });
    }
  }
  return [...byLine.values()];
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  /** Cart drawer visibility — UI state, deliberately not persisted. */
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item, quantity = 1) => {
        const { items } = get();
        const key = cartLineKey(item);
        const existing = items.find((i) => cartLineKey(i) === key);

        if (existing) {
          set({
            items: items.map((i) =>
              cartLineKey(i) === key
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity }] });
        }
      },

      removeItem: (key) => {
        set({ items: get().items.filter((i) => cartLineKey(i) !== key) });
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set({
          items: get().items.map((i) =>
            cartLineKey(i) === key ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "tengology-cart",
      // Only the contents survive a reload; drawer visibility must not.
      partialize: (state) => ({ items: state.items }),
    }
  )
);
