import Image from "next/image";
import { ProcessVideo } from "./ProcessVideo";
import type { Category, CategoryCollection } from "@/lib/taxonomy";

/**
 * The head of a category page: the craft on the left, a portrait of it on the
 * right — the same split the home page opens with.
 *
 * When a collection (or a subcategory mapped to a collection tile) is open,
 * the hero speaks for that line — name, tagline, detail, photo — instead of
 * the parent family's "Grounded Luxury" story.
 */
export function CategoryHero({
  category,
  collection,
}: {
  category: Category;
  collection?: CategoryCollection;
}) {
  const label = collection?.name ?? category.label;
  const blurb = collection ? category.label : category.blurb;
  const heading = collection?.tagline ?? category.intro.heading;
  const body = collection?.detail ?? category.intro.body;
  const photo = collection?.image ?? category.card;
  const useVideo = !collection?.image && category.media.kind === "video";
  const media = category.media;
  // Portrait hero crops for collection photos unless the taxonomy names a ratio.
  const figureStyle = collection?.image?.aspectRatio
    ? { aspectRatio: collection.image.aspectRatio }
    : undefined;

  return (
    <section className="xuan-paper border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 py-14 lg:grid-cols-12 lg:gap-16 lg:py-20">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-6">{blurb}</p>
            <h1 className="font-heading text-5xl leading-[0.92] sm:text-6xl lg:text-7xl">
              {label}
            </h1>
            <p className="mt-6 font-heading text-2xl leading-tight text-muted-foreground lg:text-3xl">
              {heading}
            </p>
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>

          <div className="lg:col-span-6">
            <figure
              className="relative aspect-[4/5] overflow-hidden bg-muted lg:aspect-[3/4]"
              style={figureStyle}
            >
              {useVideo && media.kind === "video" ? (
                <ProcessVideo
                  src={media.src}
                  poster={media.poster}
                  label={media.label}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover motion-safe:animate-[hero-zoom_14s_var(--ease-soft)_forwards]"
                />
              )}
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
