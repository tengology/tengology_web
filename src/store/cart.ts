import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantName?: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  /** Cart drawer visibility — UI state, not persisted. */
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantName?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantName?: string,
  ) => void;
  clearCart: () => void;
  /** Refresh stored line prices from current catalog prices (per product). */
  setPrices: (prices: Array<{ productId: string; price: number }>) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

function sameLine(a: { productId: string; variantName?: string }, b: { productId: string; variantName?: string }) {
  return a.productId === b.productId && (a.variantName ?? null) === (b.variantName ?? null);
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
        const existing = items.find((i) => sameLine(i, item));

        if (existing) {
          set({
            items: items.map((i) =>
              sameLine(i, item) ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity }] });
        }
      },

      removeItem: (productId, variantName) => {
        set({
          items: get().items.filter(
            (i) => !sameLine(i, { productId, variantName }),
          ),
        });
      },

      updateQuantity: (productId, quantity, variantName) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantName);
          return;
        }
        set({
          items: get().items.map((i) =>
            sameLine(i, { productId, variantName }) ? { ...i, quantity } : i,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      setPrices: (prices) => {
        const priceMap = new Map(prices.map((p) => [p.productId, p.price]));
        set({
          items: get().items.map((i) => {
            const price = priceMap.get(i.productId);
            return price != null && price !== i.price ? { ...i, price } : i;
          }),
        });
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "tengology-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
