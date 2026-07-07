"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useSquarePayments, type SquareCard } from "@/lib/use-square-payments";

export interface SquareCardFormHandle {
  tokenize: () => Promise<{ token: string; verificationToken?: string }>;
}

interface Props {
  amount: number; // pounds
  currency?: string;
  billingContact?: {
    givenName?: string;
    familyName?: string;
    email?: string;
    countryCode?: string;
    postalCode?: string;
  };
  onReady?: () => void;
  onError?: (message: string) => void;
}

export const SquareCardForm = forwardRef<SquareCardFormHandle, Props>(
  function SquareCardForm(
    { amount, currency = "GBP", billingContact, onReady, onError },
    ref
  ) {
    const { payments, error } = useSquarePayments();
    const cardRef = useRef<SquareCard | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [mounting, setMounting] = useState(true);

    // Keep latest callbacks in refs so the mount effect below never re-runs
    // (and destroys the card iframe) just because a parent re-render passed
    // a new inline closure.
    const onReadyRef = useRef(onReady);
    const onErrorRef = useRef(onError);
    useEffect(() => {
      onReadyRef.current = onReady;
      onErrorRef.current = onError;
    });

    useEffect(() => {
      if (!payments || !containerRef.current) return;
      let active = true;
      let card: SquareCard | null = null;

      (async () => {
        try {
          card = await payments.card();
          if (!active) {
            await card.destroy();
            return;
          }
          if (containerRef.current) {
            await card.attach(containerRef.current);
          }
          cardRef.current = card;
          setMounting(false);
          onReadyRef.current?.();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Could not initialise card";
          onErrorRef.current?.(message);
        }
      })();

      return () => {
        active = false;
        const c = cardRef.current;
        cardRef.current = null;
        if (c) {
          c.destroy().catch(() => {});
        }
      };
    }, [payments]);

    useImperativeHandle(
      ref,
      () => ({
        tokenize: async () => {
          const card = cardRef.current;
          if (!card) throw new Error("Payment form is not ready");

          const result = await card.tokenize();
          if (result.status !== "OK" || !result.token) {
            const message =
              result.errors?.[0]?.message ?? "Card details are invalid";
            throw new Error(message);
          }

          // Verify the buyer for SCA / 3DS if available
          let verificationToken: string | undefined;
          try {
            if (payments && "verifyBuyer" in payments) {
              const details = {
                amount: amount.toFixed(2),
                billingContact: billingContact ?? {},
                currencyCode: currency,
                intent: "CHARGE",
              };
              const verify = await (
                payments as unknown as {
                  verifyBuyer: (
                    token: string,
                    details: unknown
                  ) => Promise<{ token: string }>;
                }
              ).verifyBuyer(result.token, details);
              verificationToken = verify?.token;
            }
          } catch {
            // SCA optional — proceed without if it fails
          }

          return { token: result.token, verificationToken };
        },
      }),
      [amount, currency, billingContact, payments]
    );

    if (error) {
      return (
        <p className="text-sm text-destructive">
          Could not load payment form: {error}
        </p>
      );
    }

    return (
      <div>
        <div
          ref={containerRef}
          className="min-h-[60px] rounded-sm border bg-background"
        />
        {mounting && !error && (
          <p className="mt-2 text-xs text-muted-foreground">
            Loading secure payment form…
          </p>
        )}
      </div>
    );
  }
);
