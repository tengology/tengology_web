import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ENCYCLOPEDIA_CRYSTALS, getCrystal } from '@/lib/crystals/catalog';
import { minRetailPriceCentsForCrystal } from '@/lib/crystals/retailPricing';
import { ScienceVsLore } from '@/features/encyclopedia/ScienceVsLore';
import { formatCents } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Gem, Sparkles } from 'lucide-react';

export const dynamicParams = false;

export function generateStaticParams() {
  return ENCYCLOPEDIA_CRYSTALS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCrystal(slug);
  if (!c || c.category !== 'crystal') return {};
  return { title: c.name, description: c.blurb };
}

export default async function CrystalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCrystal(slug);
  if (!c || c.category !== 'crystal') notFound();
  const fromPriceCents = minRetailPriceCentsForCrystal(c);

  return (
    <section className="relative isolate flex min-h-[calc(100svh-var(--header-h,5rem))] flex-col overflow-hidden bg-[#1a0e0c] text-white">
      <img
        src="/lookbook/encyclopedia-detail-ai.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.36]"
        loading="eager"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,14,12,0.94)_0%,rgba(26,14,12,0.82)_46%,rgba(26,14,12,0.62)_100%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-12 pt-3 sm:px-6 sm:pb-16 sm:pt-4">
        <nav className="flex h-16 items-center justify-between gap-3 rounded-lg border border-white/14 bg-[#1a0e0c]/72 px-3 shadow-[0_16px_48px_rgba(7,13,11,0.22)] backdrop-blur-md sm:px-4">
          <Link href="/encyclopedia" className="inline-flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-white/76 transition hover:bg-card/10 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span>All stones</span>
          </Link>
          <Link
            href="/designer/bracelet"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-rose-dark px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose sm:px-4"
          >
            <span>Designer</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        <header className="grid gap-7 py-10 md:grid-cols-[280px_minmax(0,1fr)] md:items-center lg:grid-cols-[340px_minmax(0,1fr)] lg:py-14">
          <div className="grid aspect-square place-items-center rounded-lg border border-white/16 bg-white/[0.08] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm">
            <img
              src={c.paletteImage ?? c.images[0]}
              alt=""
              loading="eager"
              className="h-full max-h-64 w-full object-contain md:max-h-72"
            />
          </div>
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#d5a2a5]">
              <Gem className="h-3.5 w-3.5" />
              {c.color}
            </p>
            <h1 className="mt-4 font-heading text-5xl leading-[0.92] sm:text-6xl lg:text-7xl">{c.name}</h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/78 sm:text-lg">{c.blurb}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              {c.chakra.map((k) => (
                <span key={k} className="inline-flex h-8 items-center rounded-lg border border-white/16 bg-white/[0.08] px-2.5 capitalize text-white/76">
                  {k.replace('-', ' ')} chakra
                </span>
              ))}
              {c.zodiac.map((z) => (
                <span key={z} className="inline-flex h-8 items-center rounded-lg border border-white/16 bg-white/[0.08] px-2.5 capitalize text-white/76">
                  {z}
                </span>
              ))}
              {c.element && (
                <span className="inline-flex h-8 items-center rounded-lg border border-white/16 bg-white/[0.08] px-2.5 capitalize text-white/76">
                  {c.element}
                </span>
              )}
            </div>
            <div className="mt-5 text-sm font-semibold text-[#d5a2a5]">From {formatCents(fromPriceCents)} per bead</div>
          </div>
        </header>

        <ScienceVsLore
          tone="dark"
          science={
            <>
              <p>
                {c.name} is a {c.formation ?? 'naturally occurring'} mineral
                {c.hardness ? `, Mohs hardness ${c.hardness},` : ''} typically sourced from{' '}
                {c.origin.length ? c.origin.join(', ') : 'multiple regions worldwide'}.
              </p>
              {c.sourcing.length > 0 && (
                <p className="mt-2 text-white/60">
                  Our supply chain: {c.sourcing.map((s) => `${s.region} (${s.method}${s.fairTradeCertified ? ', fair-trade certified' : ''})`).join('; ')}.
                </p>
              )}
            </>
          }
          lore={
            <>
              <p>
                Across traditions {c.name.toLowerCase()} has been associated with{' '}
                <em>{c.intention.join(', ')}</em>. We share these correspondences as cultural tradition,
                not medical claim.
              </p>
              {c.zodiac.length > 0 && (
                <p className="mt-2 text-white/60">
                  Often gifted to those born under {c.zodiac.join(' and ')}.
                </p>
              )}
            </>
          }
        />

        <section className="mt-8 rounded-lg border border-white/16 bg-white/[0.08] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#d5a2a5]">
                <Sparkles className="h-4 w-4" />
                Use in your design
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/78">
                Designs are handmade in Britain after ordering, usually crafted in our
                Oxfordshire studio within 2-3 days.
              </p>
            </div>
            <Link
              href="/designer/bracelet"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-rose-dark px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-rose"
            >
              Add to bracelet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          </section>
        </div>
    </section>
  );
}
