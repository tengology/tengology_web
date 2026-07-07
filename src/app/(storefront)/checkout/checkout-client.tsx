"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore, type CartItem } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2, Lock } from "lucide-react";
import {
  SquareCardForm,
  type SquareCardFormHandle,
} from "@/components/storefront/SquareCardForm";

interface SavedAddress {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  city: string;
  county: string | null;
  postcode: string;
  country: string;
  isDefault: boolean;
}

interface Props {
  isSignedIn: boolean;
  defaults: { name: string; email: string };
  savedAddresses: SavedAddress[];
  shipping: { baseRate: number; freeThreshold: number | null };
}

const emptyForm = {
  email: "",
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  city: "",
  county: "",
  postcode: "",
};

export function CheckoutClient({
  isSignedIn,
  defaults,
  savedAddresses,
  shipping: shippingZone,
}: Props) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const clearCart = useCartStore((s) => s.clearCart);
  const setPrices = useCartStore((s) => s.setPrices);

  const cardRef = useRef<SquareCardFormHandle>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Set when payment succeeds — keeps the cleared cart from flashing the
  // "nothing to check out" state while navigating to the confirmation.
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [error]);
  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.find((a) => a.isDefault)?.id ?? savedAddresses[0]?.id ?? ""
  );

  const initialName = defaults.name.trim().split(" ");
  const [form, setForm] = useState(() => {
    const preset = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    if (preset) {
      return {
        email: defaults.email,
        firstName: preset.firstName,
        lastName: preset.lastName,
        line1: preset.line1,
        line2: preset.line2 ?? "",
        city: preset.city,
        county: preset.county ?? "",
        postcode: preset.postcode,
      };
    }
    return {
      ...emptyForm,
      email: defaults.email,
      firstName: initialName[0] ?? "",
      lastName: initialName.slice(1).join(" "),
    };
  });

  const update = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const applySavedAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
      setForm((f) => ({
        ...emptyForm,
        email: f.email,
      }));
      return;
    }
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    setForm((f) => ({
      ...f,
      firstName: addr.firstName,
      lastName: addr.lastName,
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      county: addr.county ?? "",
      postcode: addr.postcode,
    }));
  };

  const shipping =
    shippingZone.freeThreshold != null && totalPrice >= shippingZone.freeThreshold
      ? 0
      : shippingZone.baseRate;
  const total = totalPrice + shipping;

  const billingContact = useMemo(
    () => ({
      givenName: form.firstName,
      familyName: form.lastName,
      email: form.email,
      countryCode: "GB",
      postalCode: form.postcode,
    }),
    [form.firstName, form.lastName, form.email, form.postcode]
  );

  if (items.length === 0 && completed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center animate-in fade-in duration-500 lg:py-32">
        <p className="eyebrow mb-4">Checkout</p>
        <h1 className="font-heading mb-8 text-4xl leading-[0.95] sm:text-5xl">
          Payment received — taking you to your <em>confirmation</em>&hellip;
        </h1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center animate-in fade-in duration-500 lg:py-32">
        <p className="eyebrow mb-4">Checkout</p>
        <h1 className="font-heading mb-8 text-4xl leading-[0.95] sm:text-5xl">
          Nothing to <em>check out</em>
        </h1>
        <Button asChild className="text-xs uppercase tracking-[0.2em]">
          <Link href="/shop">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { token, verificationToken } = await cardRef.current!.tokenize();

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantName: i.variantName,
            quantity: i.quantity,
          })),
          shippingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            county: form.county,
            postcode: form.postcode,
            country: "GB",
          },
          email: form.email,
          sourceId: token,
          verificationToken,
          saveAddress: saveAddress && isSignedIn,
          expectedTotal: total,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409 && Array.isArray(data.items)) {
          // Prices changed since the items were added — refresh the stored
          // prices so the summary re-renders with current amounts.
          setPrices(
            data.items.map((i: { productId: string; unitPrice: number }) => ({
              productId: i.productId,
              price: i.unitPrice,
            }))
          );
        }
        throw new Error(data.error || "Checkout failed");
      }

      const { orderNumber } = await res.json();
      setCompleted(true);
      clearCart();
      router.push(`/checkout/confirmation?order=${orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <header className="mb-10 border-t pt-6">
        <p className="eyebrow mb-4">Secure checkout</p>
        <h1 className="font-heading text-5xl leading-[0.95] lg:text-6xl">
          Checkout
        </h1>
      </header>

      <details className="group mb-8 border-b border-t lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
          <span className="eyebrow text-foreground">
            Order summary &middot; &pound;{total.toFixed(2)}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <div className="pb-5">
          <SummaryLines
            items={items}
            subtotal={totalPrice}
            shipping={shipping}
            total={total}
          />
        </div>
      </details>

      <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">
          {!isSignedIn && (
            <p className="text-sm text-muted-foreground">
              Have an account?{" "}
              <Link
                href={`/auth/signin?callbackUrl=${encodeURIComponent("/checkout")}`}
                className="link-underline hover:text-moss"
              >
                Sign in
              </Link>{" "}
              to use your saved addresses.
            </p>
          )}

          {error && (
            <div
              ref={errorRef}
              role="alert"
              className="border border-clay/40 bg-clay/5 p-4 text-sm text-clay"
            >
              {error}
            </div>
          )}

          <section className="border-t pt-6">
            <h2 className="eyebrow mb-4 text-foreground">Contact</h2>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                disabled={isSignedIn}
              />
            </div>
          </section>

          <section className="border-t pt-6">
            <h2 className="eyebrow mb-4 text-foreground">Shipping Address</h2>

            {savedAddresses.length > 0 && (
              <div className="mb-4 space-y-2">
                {savedAddresses.map((a) => (
                  <label
                    key={a.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 border p-4 transition-colors duration-150",
                      selectedAddressId === a.id
                        ? "border-foreground bg-muted/40"
                        : "hover:bg-muted/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      value={a.id}
                      checked={selectedAddressId === a.id}
                      onChange={() => applySavedAddress(a.id)}
                      className="mt-1 accent-foreground"
                    />
                    <div className="text-sm">
                      <p className="font-medium">
                        {a.firstName} {a.lastName}
                        {a.isDefault && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-muted-foreground">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ""}, {a.city},{" "}
                        {a.postcode}
                      </p>
                    </div>
                  </label>
                ))}
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 border p-4 transition-colors duration-150",
                    selectedAddressId === "new"
                      ? "border-foreground bg-muted/40"
                      : "hover:bg-muted/40"
                  )}
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    value="new"
                    checked={selectedAddressId === "new"}
                    onChange={() => applySavedAddress("new")}
                    className="accent-foreground"
                  />
                  <span className="text-sm font-medium">
                    Use a different address
                  </span>
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="line1">Address</Label>
                <Input
                  id="line1"
                  value={form.line1}
                  onChange={(e) => update("line1", e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="line2">Address line 2 (optional)</Label>
                <Input
                  id="line2"
                  value={form.line2}
                  onChange={(e) => update("line2", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  value={form.county}
                  onChange={(e) => update("county", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={form.postcode}
                  onChange={(e) => update("postcode", e.target.value)}
                  required
                />
              </div>
            </div>

            {isSignedIn && selectedAddressId === "new" && (
              <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                />
                Save this address to my account
              </label>
            )}
          </section>

          <section className="border-t pt-6">
            <h2 className="eyebrow mb-4 text-foreground">Payment</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Card payments are processed securely by Square. We never see
              your card details.
            </p>
            <SquareCardForm
              ref={cardRef}
              amount={total}
              currency="GBP"
              billingContact={billingContact}
              onError={(m) => setError(m)}
            />
          </section>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-12 text-xs tracking-[0.2em] uppercase",
                loading && "opacity-70"
              )}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Pay &pound;{total.toFixed(2)}
            </Button>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span className="eyebrow">Secured by Square</span>
            </div>
          </div>
        </form>

        <aside className="hidden lg:block lg:col-span-2">
          <div className="sticky top-28 border bg-muted/30 p-6">
            <h2 className="eyebrow mb-4 text-foreground">Order Summary</h2>
            <SummaryLines
              items={items}
              subtotal={totalPrice}
              shipping={shipping}
              total={total}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryLines({
  items,
  subtotal,
  shipping,
  total,
}: {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  return (
    <>
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div
            key={`${item.productId}::${item.variantName ?? ""}`}
            className="flex justify-between text-sm"
          >
            <span className="text-muted-foreground">
              {item.title} &times; {item.quantity}
            </span>
            <span>&pound;{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>&pound;{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className={cn(shipping === 0 && "text-moss")}>
            {shipping === 0 ? "Free" : `£${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between font-medium pt-2 border-t">
          <span>Total</span>
          <span>&pound;{total.toFixed(2)}</span>
        </div>
      </div>
    </>
  );
}
