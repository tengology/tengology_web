import { SquareClient, SquareEnvironment } from "square";

const globalForSquare = globalThis as unknown as {
  square: SquareClient | undefined;
};

export function isSquareConfigured(): boolean {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  // Treat the .env.example placeholders (EAAAEXXXX… / LXXXX…) as unset.
  const isPlaceholder = (value: string) => /X{5,}/.test(value);
  return Boolean(
    token && locationId && !isPlaceholder(token) && !isPlaceholder(locationId)
  );
}

export function getSquareClient(): SquareClient {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "SQUARE_ACCESS_TOKEN is not set. Add it to your .env.local file."
    );
  }
  if (!globalForSquare.square) {
    const environment =
      process.env.SQUARE_ENVIRONMENT === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox;
    globalForSquare.square = new SquareClient({ token, environment });
  }
  return globalForSquare.square;
}

export const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID ?? "";
export const SQUARE_CURRENCY =
  (process.env.SQUARE_CURRENCY as "GBP" | "USD" | "EUR" | undefined) ?? "GBP";

export function poundsToMinorUnits(amount: number): bigint {
  return BigInt(Math.round(amount * 100));
}

export function minorUnitsToPounds(amount: bigint | number | string): number {
  const value =
    typeof amount === "bigint" ? Number(amount) : Number(amount ?? 0);
  return value / 100;
}
