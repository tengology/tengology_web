import type { JewelryKind, KindId } from '../types';
import { bracelet } from './bracelet';
import { necklace } from './necklace';
import { ring } from './ring';
import { earrings } from './earrings';

export const KINDS: Record<KindId, JewelryKind> = {
  bracelet,
  necklace,
  ring,
  earrings,
};

/**
 * The kinds offered in the designer right now.
 *
 * Necklace, ring, and earrings are built and still registered in KINDS above —
 * the engine can price, size, and render them — they are simply not on sale
 * yet. This list is the only gate: it drives the kind tabs, which routes get
 * built, and the 404 on /designer/<kind>. Add an id back to reopen that kind.
 */
export const KIND_IDS: KindId[] = ['bracelet'];

/** Every kind the engine understands, including ones not currently offered. */
export const ALL_KIND_IDS: KindId[] = ['bracelet', 'necklace', 'ring', 'earrings'];

export function getKind(id: KindId): JewelryKind {
  return KINDS[id];
}

export { bracelet, necklace, ring, earrings };
export { NECKLACE_LENGTH_MM } from './necklace';
