"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Square?: {
      payments: (
        applicationId: string,
        locationId: string
      ) => Promise<SquarePayments>;
    };
  }
}

export interface SquareCard {
  attach: (selector: string | HTMLElement) => Promise<void>;
  tokenize: () => Promise<{
    status: string;
    token?: string;
    errors?: Array<{ message: string }>;
  }>;
  destroy: () => Promise<void>;
}

export interface SquarePayments {
  card: (options?: Record<string, unknown>) => Promise<SquareCard>;
}

const SDK_URL_SANDBOX = "https://sandbox.web.squarecdn.com/v1/square.js";
const SDK_URL_PRODUCTION = "https://web.squarecdn.com/v1/square.js";

let sdkPromise: Promise<void> | null = null;

function loadSquareSdk(environment: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Square) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  const url = environment === "production" ? SDK_URL_PRODUCTION : SDK_URL_SANDBOX;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${url}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Square Web Payments SDK"))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Square Web Payments SDK"));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

const SQUARE_APP_ID = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "";
const SQUARE_LOCATION = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";
const SQUARE_ENV = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT ?? "sandbox";

const configError =
  SQUARE_APP_ID && SQUARE_LOCATION
    ? null
    : "Square is not configured. Set NEXT_PUBLIC_SQUARE_APPLICATION_ID and NEXT_PUBLIC_SQUARE_LOCATION_ID.";

export function useSquarePayments() {
  const [payments, setPayments] = useState<SquarePayments | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    if (configError) return;

    let cancelled = false;
    loadSquareSdk(SQUARE_ENV)
      .then(async () => {
        if (cancelled) return;
        if (!window.Square) {
          setRuntimeError("Square SDK did not initialise");
          return;
        }
        const p = await window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION);
        if (!cancelled) setPayments(p);
      })
      .catch((err) => {
        if (!cancelled) setRuntimeError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { payments, error: configError ?? runtimeError };
}
