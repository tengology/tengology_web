import type { Prisma } from '@/generated/prisma/client';

// Product-type views preserve existing named ranges such as Comet and Bridal Party.
export const GEMSTONE_TYPES = ['Necklaces', 'Bracelets', 'Rings', 'Earrings'] as const;
export function gemstoneCollectionFilter(name: string | undefined): Prisma.ProductWhereInput | undefined {
  const words: Record<string, string[]> = {
    Necklaces: ['necklace', 'choker', 'pendant'],
    Bracelets: ['bracelet', 'bangle'],
    Earrings: ['earring'],
  };
  if (name === 'Rings') return { subcategory: 'JEWELLERY', OR: [
    { title: { startsWith: 'Ring', mode: 'insensitive' } },
    { title: { contains: ' ring', mode: 'insensitive' } },
  ] };
  const terms = name ? words[name] : undefined;
  return terms ? { subcategory: 'JEWELLERY', OR: terms.map(word => ({ title: { contains: word, mode: 'insensitive' as const } })) } : undefined;
}
