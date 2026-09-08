import Image from "next/image";
import { ProcessVideo } from "./ProcessVideo";
import type { Category, CategoryCollection } from "@/lib/taxonomy";

/**
 * The head of a category page: the craft on the left, a portrait of it on the
 * right — the same split the home page opens with.
 *
 * It replaces a wide banner strip that carried the title over a 40%-opacity
 * crop. That treatment washed out the photograph and letterboxed work that was
 * shot portrait; here the image is given its full height and the copy is read
 * rather than overlaid.
 *
 * The visual is the family's `card` — the crop already cut portrait for the
 * home page — except where the family has a process clip, which is worth more
 * than a still and is already shot vertical.
 */
export function CategoryHero({ category, collection }: { category: Category; collection?: CategoryCollection }) {
  const { label, blurb, intro, card, media } = category;
  const photo = collection?.image ?? card;
  const useVideo = !collection?.image && media.kind === "video";

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
              {intro.heading}
            </p>
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
              {intro.body}
            </p>
          </div>

          <div className="lg:col-span-6">
            <figure
              className="relative aspect-[4/5] overflow-hidden bg-muted lg:aspect-[3/4]"
              style={collection?.image ? { aspectRatio: collection.image.aspectRatio ?? "4 / 3" } : undefined}
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
                  className={collection?.image ? "object-contain" : "object-cover motion-safe:animate-[hero-zoom_14s_var(--ease-soft)_forwards]"}
                />
              )}
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
