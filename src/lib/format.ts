export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(num);
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  // 8 hex chars (~4.3bn values) — order numbers are used as a lookup
  // credential alongside the buyer email, so they must not be guessable.
  // Web Crypto keeps this module safe to import from client components.
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const seq = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `TNG-${year}-${seq}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
