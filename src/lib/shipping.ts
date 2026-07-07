import { prisma } from "./db";

export interface ShippingZoneConfig {
  baseRate: number;
  freeThreshold: number | null;
}

export const DEFAULT_SHIPPING: ShippingZoneConfig = {
  baseRate: 3.95,
  freeThreshold: 50,
};

/**
 * Server-only: reads the active shipping zone from the database, falling
 * back to the defaults when no zone has been configured yet. Client
 * components receive the resolved config as props.
 */
export async function getShippingZone(): Promise<ShippingZoneConfig> {
  try {
    const zone = await prisma.shippingZone.findFirst({
      orderBy: { name: "asc" },
    });
    if (zone) {
      return { baseRate: zone.baseRate, freeThreshold: zone.freeThreshold };
    }
  } catch (err) {
    console.error("Failed to load shipping zone, using defaults:", err);
  }
  return DEFAULT_SHIPPING;
}

export function computeShipping(
  subtotal: number,
  zone: ShippingZoneConfig
): number {
  if (zone.freeThreshold != null && subtotal >= zone.freeThreshold) return 0;
  return zone.baseRate;
}
