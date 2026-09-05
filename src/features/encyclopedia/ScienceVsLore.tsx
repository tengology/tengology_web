import { Atom, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Signature differentiator vs. ASTRIS — every crystal page contrasts a sober,
 * mineralogical "Science" panel with a "Lore" panel of cultural/spiritual
 * tradition. We give both equal weight and never present lore as medical claim.
 *
 * `tone="dark"` sits the pair on the crystal page's dark hero, borrowing the
 * same translucent-card and rose-accent vocabulary the chips above it use, so
 * the block reads as part of that band rather than a light card dropped onto it.
 */
export function ScienceVsLore({
  science,
  lore,
  tone = 'light',
}: {
  science: React.ReactNode;
  lore: React.ReactNode;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';

  const panel = dark
    ? 'rounded-lg border border-white/16 bg-white/[0.08] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-5'
    : 'panel rounded-lg p-4 sm:p-5';
  const body = cn('mt-2 text-sm leading-relaxed', dark ? 'text-white/78' : 'text-foreground/90');
  const heading = 'flex items-center gap-2 text-xs font-semibold uppercase tracking-wider';

  return (
    <div className="not-prose grid gap-3 md:grid-cols-2">
      <section className={panel}>
        <div className={cn(heading, dark ? 'text-white/76' : 'text-muted-foreground')}>
          <Atom className="w-3.5 h-3.5" /> Science
        </div>
        <div className={body}>{science}</div>
      </section>
      <section className={panel}>
        <div className={cn(heading, dark ? 'text-[#d5a2a5]' : 'text-rose-dark')}>
          <Sparkles className="w-3.5 h-3.5" /> Lore
        </div>
        <div className={body}>{lore}</div>
      </section>
    </div>
  );
}
