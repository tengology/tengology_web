import { z } from "zod";
import { tryDecodeDesign } from "@/features/designer/engine/serialize";
import { priceDesign } from "@/features/designer/engine/pricing";
import { getCrystal } from "./crystals/catalog";
import { innerCircumferenceMm } from "@/features/designer/engine/wristFit";

const snapshotSchema = z.object({
  version: z.literal(1), encoded: z.string(), kind: z.literal("bracelet"),
  wristMm: z.number(), innerMm: z.number(), band: z.literal("elastic"), unitPrice: z.number(),
  beads: z.array(z.object({ position: z.number(), slug: z.string(), name: z.string(), color: z.string(), hex: z.string(), sizeMm: z.number(), variant: z.number(), image: z.string() })),
});
export type DesignSnapshot = z.infer<typeof snapshotSchema>;

/** Freeze catalogue names, sizes, colours and sequence at order time. */
export function createDesignSnapshot(encoded: string): DesignSnapshot {
  const d = tryDecodeDesign(encoded);
  if (!d || d.kind !== "bracelet" || d.sizing.kind !== "bracelet" || d.findings.kind !== "bracelet" || d.focal || d.beads.length < 1 || d.beads.length > 150 || d.originIndex >= d.beads.length) throw Error("Please reopen your bracelet in the designer and review it.");
  const ordered = [...d.beads.slice(d.originIndex), ...d.beads.slice(0, d.originIndex)];
  const beads = ordered.map((b, i) => {
    const c = getCrystal(b.crystalSlug);
    const variant = b.variantIndex ?? 0;
    if (!c || !(c.availableSizesMm ?? [4, 6, 8, 10, 12, 14]).includes(b.sizeMm) || !c.images[variant]) throw Error("A selected bead or size is no longer available. Please review your design.");
    return { position: i + 1, slug: c.slug, name: c.name, color: c.color, hex: c.hex, sizeMm: b.sizeMm, variant: variant + 1, image: c.images[variant] };
  });
  return { version: 1, encoded, kind: "bracelet", wristMm: d.sizing.wristMm, innerMm: Math.round(innerCircumferenceMm(d.beads)), band: "elastic", unitPrice: priceDesign(d).totalCents / 100, beads };
}

export function readDesignSnapshot(raw?: string | null): DesignSnapshot | null {
  if (!raw) return null;
  try { return snapshotSchema.parse(JSON.parse(raw)); } catch { return null; }
}

export function beadPickList(d: DesignSnapshot, quantity = 1) {
  const groups = new Map<string, { name: string; slug: string; color: string; sizeMm: number; count: number }>();
  for (const b of d.beads) {
    const key = `${b.slug}:${b.sizeMm}`;
    const row = groups.get(key) ?? { name: b.name, slug: b.slug, color: b.color, sizeMm: b.sizeMm, count: 0 };
    row.count += quantity;
    groups.set(key, row);
  }
  return [...groups.values()];
}
