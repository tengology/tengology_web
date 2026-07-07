import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const orderNumber = params.order;

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center lg:py-32">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="mx-auto mb-8 h-16 w-16"
      >
        <circle
          cx="12"
          cy="12"
          r="9.5"
          strokeWidth="1.25"
          className="stroke-moss [stroke-dasharray:60] animate-[check-draw_700ms_var(--ease-soft)_both]"
        />
        <path
          d="M7.5 12.5l3 3 6-6.5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-moss [stroke-dasharray:60] animate-[check-draw_500ms_var(--ease-soft)_350ms_both]"
        />
      </svg>

      <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 delay-150">
        <p className="eyebrow mb-4">Order confirmed</p>
        <h1 className="font-heading text-4xl leading-[0.95] sm:text-5xl">
          Thank <em>you</em>
        </h1>
      </div>

      {orderNumber && (
        <div className="mt-8 inline-block border px-10 py-5 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 delay-300">
          <p className="eyebrow mb-2">Order number</p>
          <p className="font-heading text-2xl">{orderNumber}</p>
        </div>
      )}

      <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 delay-500">
        <p className="mx-auto mt-8 max-w-md leading-relaxed text-muted-foreground">
          We&apos;ll send you a confirmation email with your order details.
          Each item is handmade with care, so please allow a few days for
          preparation.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Button asChild className="text-xs uppercase tracking-[0.2em]">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="text-xs uppercase tracking-[0.2em]"
          >
            <Link href="/account/orders">View Orders</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          <Link
            href="/orders/lookup"
            className="link-underline text-foreground transition-colors hover:text-moss"
          >
            Track your order
          </Link>
        </p>
      </div>
    </div>
  );
}
