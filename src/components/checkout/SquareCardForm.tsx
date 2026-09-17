"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Loader2, Lock } from "lucide-react";

/**
 * Square Web Payments SDK card entry.
 *
 * The card fields live in an iframe hosted by Square, so card numbers never
 * enter our DOM or our server — we only ever receive a single-use token.
 * `tokenize()` also runs `verifyBuyer`, which triggers 3-D Secure when the
 * bank asks for it (required for Strong Customer Authentication in the UK/EU).
 */

export interface SquareTokenResult {
  ok: boolean;
  token?: string;
  verificationToken?: string;
  error?: string;
}

export type SquarePaymentMethod = "card" | "applePay" | "googlePay" | "afterpayClearpay";
type WalletMethod = Exclude<SquarePaymentMethod, "card">;
export interface SquareCardFormHandle {
  tokenize: (details: VerificationDetails, method?: SquarePaymentMethod) => Promise<SquareTokenResult>;
  isReady: () => boolean;
}

export interface VerificationDetails {
  amount: string;
  billingContact: {
    givenName?: string;
    familyName?: string;
    email?: string;
    phone?: string;
    addressLines?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
  };
}

interface SquareCard {
  attach: (selector: string | HTMLElement) => Promise<void>;
  tokenize: () => Promise<{ status: string; token?: string; errors?: Array<{ message: string }> }>;
  configure: (options: { postalCode?: string }) => Promise<void>;
  destroy: () => Promise<void>;
}

interface SquarePayments {
  setLocale: (locale: string) => Promise<unknown>;
  paymentRequest: (options: Record<string, unknown>) => unknown;
  applePay: (request: unknown) => Promise<SquareWallet>;
  googlePay: (request: unknown) => Promise<SquareWallet>;
  afterpayClearpay: (request: unknown) => Promise<SquareWallet>;
  card: (options?: Record<string, unknown>) => Promise<SquareCard>;
  verifyBuyer: (
    token: string,
    details: Record<string, unknown>
  ) => Promise<{ token?: string } | null>;
}

interface SquareWallet {
  tokenize: SquareCard["tokenize"];
  attach?: (element: HTMLElement) => Promise<void>;
  destroy: () => Promise<void>;
}

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => SquarePayments;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadSquareSdk(environment: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Square) return Promise.resolve();

  if (!scriptPromise) {
    const src =
      environment === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js";

    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Square SDK failed to load")));
        if (window.Square) resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Square SDK failed to load"));
      };
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

export function SquareCardForm({
  applicationId,
  locationId,
  environment,
  currency = "GBP",
  postalCode = "",
  ref,
  onReadyChange,
  amount,
  disabled,
  onWalletPay,
  shippingContact,
}: {
  applicationId: string;
  locationId: string;
  environment: string;
  currency?: string;
  /**
   * Billing postcode from our own address form. Square renders its own
   * postal-code field inside the iframe, so without this the buyer types the
   * same value twice — and the two can disagree, which AVS then declines.
   */
  postalCode?: string;
  ref?: React.Ref<SquareCardFormHandle>;
  onReadyChange?: (ready: boolean) => void;
  amount: string;
  disabled?: boolean;
  onWalletPay: (event: React.MouseEvent, method: WalletMethod) => void;
  shippingContact: VerificationDetails["billingContact"];
}) {
  const googleContainerRef = useRef<HTMLDivElement>(null);
  const clearpayContainerRef = useRef<HTMLDivElement>(null);
  const walletsRef = useRef<Partial<Record<WalletMethod, SquareWallet>>>({});
  const [wallets, setWallets] = useState({ applePay: false, googlePay: false, afterpayClearpay: false });
  const shippingKey = JSON.stringify(shippingContact);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<SquareCard | null>(null);
  const paymentsRef = useRef<SquarePayments | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string>("");

  // Read at attach time without making the card element re-initialise (and so
  // discard whatever the buyer has typed) every time the postcode changes.
  const postalCodeRef = useRef(postalCode);
  postalCodeRef.current = postalCode;

  useEffect(() => {
    let cancelled = false;
    let attachedCard: SquareCard | null = null;

    async function initialise() {
      try {
        await loadSquareSdk(environment);
        if (cancelled || !window.Square || !containerRef.current) return;

        const payments = window.Square.payments(applicationId, locationId);
        await payments.setLocale("en-GB");
        paymentsRef.current = payments;

        const card = await payments.card({
          postalCode: postalCodeRef.current || undefined,
          style: {
            input: { fontSize: "15px" },
            ".input-container": { borderRadius: "4px" },
          },
        });

        if (cancelled) {
          await card.destroy().catch(() => {});
          return;
        }

        await card.attach(containerRef.current);
        attachedCard = card;
        cardRef.current = card;
        setStatus("ready");
        onReadyChange?.(true);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Card entry couldn't be loaded.");
        onReadyChange?.(false);
      }
    }

    initialise();

    return () => {
      cancelled = true;
      attachedCard?.destroy().catch(() => {});
      cardRef.current = null;
    };
    // Re-initialising on every render would tear down the iframe mid-typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, locationId, environment]);

  // Rebuild only wallets when the quoted total changes; never tear down card entry.
  useEffect(() => {
    const payments = paymentsRef.current;
    if (status !== "ready" || !payments || Number(amount) <= 0) return;
    let cancelled = false;
    const created: SquareWallet[] = [];
    walletsRef.current = {};
    setWallets({ applePay: false, googlePay: false, afterpayClearpay: false });
    for (const method of ["applePay", "googlePay", "afterpayClearpay"] as const) {
      void (async () => {
        try {
          const contact = JSON.parse(shippingKey) as VerificationDetails["billingContact"];
          if (method === "afterpayClearpay" && (contact.countryCode !== "GB" || !contact.postalCode || !contact.addressLines?.[0] || !contact.givenName || !contact.familyName || Number(amount) < 1 || Number(amount) > 1000)) return;
          const request = payments.paymentRequest({
            countryCode: "GB", currencyCode: currency,
            total: { amount, label: "Tengology total" },
            ...(method === "afterpayClearpay" ? { requestShippingContact: false, shippingContact: contact } : {}),
          });
          const wallet = await payments[method](request);
          created.push(wallet);
          if (cancelled) { await wallet.destroy(); return; }
          if (method === "googlePay" && googleContainerRef.current) {
            await wallet.attach?.(googleContainerRef.current);
          }
          if (method === "afterpayClearpay" && clearpayContainerRef.current) {
            await wallet.attach?.(clearpayContainerRef.current);
          }
          if (cancelled) { await wallet.destroy(); return; }
          walletsRef.current[method] = wallet;
          setWallets((previous) => ({ ...previous, [method]: true }));
        } catch {
          // Unsupported browser/device/domain must not prevent card payments.
        }
      })();
    }
    return () => {
      cancelled = true;
      walletsRef.current = {};
      for (const wallet of created) void wallet.destroy().catch(() => {});
    };
  }, [status, amount, currency, shippingKey]);

  // Keep Square's postal-code field in step with the address form when the
  // buyer edits it after the card element has already attached. `configure`
  // updates the live iframe in place, so nothing they've typed is lost.
  useEffect(() => {
    if (status !== "ready" || !cardRef.current || !postalCode) return;
    // A rejected update must never block checkout — the buyer can still type
    // the value themselves, and tokenize() surfaces any real problem.
    cardRef.current.configure({ postalCode }).catch(() => {});
  }, [postalCode, status]);

  useImperativeHandle(
    ref,
    () => ({
      isReady: () => status === "ready" && Boolean(cardRef.current),
      tokenize: async (details: VerificationDetails, method = "card"): Promise<SquareTokenResult> => {
        const card = method === "card" ? cardRef.current : walletsRef.current[method];
        const payments = paymentsRef.current;

        if (!card || !payments) {
          return { ok: false, error: "Card entry isn't ready yet. Please wait a moment." };
        }

        try {
          const result = await card.tokenize();

          if (result.status !== "OK" || !result.token) {
            return {
              ok: false,
              error: result.errors?.[0]?.message ?? "Please check your card details.",
            };
          }

          // Strong Customer Authentication. If the bank challenges the buyer,
          // Square renders the 3-D Secure modal here and resolves once passed.
          let verificationToken: string | undefined;
          // Clearpay authenticates the buyer in its own checkout, not card 3DS.
          if (method === "afterpayClearpay") return { ok: true, token: result.token };
          try {
            const verification = await payments.verifyBuyer(result.token, {
              amount: details.amount,
              currencyCode: currency,
              intent: "CHARGE",
              customerInitiated: true,
              sellerKeepsCard: false,
              billingContact: details.billingContact,
            });
            verificationToken = verification?.token;
          } catch {
            return { ok: false, error: "Payment verification was not completed. Please try again." };
          }

          return { ok: true, token: result.token, verificationToken };
        } catch (err) {
          return {
            ok: false,
            error: err instanceof Error ? err.message : "We couldn't read those card details.",
          };
        }
      },
    }),
    [status, currency]
  );

  return (
    <div className="rounded-sm border bg-muted/20 p-4 sm:p-5">
      <h3 className="mb-1 text-sm font-medium">Choose how to pay</h3>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">Your total includes the selected delivery service. Available wallets appear below on supported devices.</p>
      <div className="mb-4 flex flex-wrap gap-3">
        {wallets.applePay && (
          <button type="button" aria-label="Pay with Apple Pay"
            disabled={disabled}
            onClick={(event) => onWalletPay(event, "applePay")}
            className="h-11 min-w-40 disabled:opacity-50 [-webkit-appearance:-apple-pay-button] [-apple-pay-button-type:pay] [-apple-pay-button-style:black]"
          />
        )}
        <div ref={googleContainerRef}
          className={disabled ? "pointer-events-none opacity-50" : ""}
          hidden={!wallets.googlePay}
          onClickCapture={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!disabled) onWalletPay(event, "googlePay");
          }}
        />
      </div>
      <div ref={clearpayContainerRef}
        hidden={!wallets.afterpayClearpay}
        className={disabled ? "mb-4 pointer-events-none opacity-50" : "mb-4"}
        onClickCapture={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled) onWalletPay(event, "afterpayClearpay");
        }}
      />
      {shippingContact.countryCode === "GB" && !wallets.afterpayClearpay && <p className="mb-3 text-xs text-muted-foreground">Clearpay is available on eligible UK orders. Complete your delivery address to check availability.</p>}
      <h4 className="mb-2 border-t pt-4 text-sm font-medium">Credit or debit card</h4>
      <div
        ref={containerRef}
        className="min-h-[90px] rounded-sm border bg-background p-3 transition-opacity data-[loading=true]:opacity-50"
        data-loading={status === "loading"}
      />

      {status === "loading" && (
        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading secure card entry…
        </p>
      )}

      {status === "error" && (
        <p className="mt-2 text-xs text-destructive">
          {error} Please refresh the page and try again.
        </p>
      )}

      {status === "ready" && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          Encrypted and processed by Square. We never see your card number.
        </p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Enter your card number first, then its billing postcode. UK-issued cards accept UK postcodes, including letters and spaces.
      </p>
      {environment !== "production" && <p className="mt-2 text-xs text-amber-700">Test checkout — no real payment will be taken.</p>}
    </div>
  );
}
