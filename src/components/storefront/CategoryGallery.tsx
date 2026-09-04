import Image from "next/image";
import { ProcessVideo } from "./ProcessVideo";
import type { Category } from "@/lib/taxonomy";

/**
 * Work shown rather than sold.
 *
 * A family can be on the site as a body of work before any of it is listed —
 * glass is cut in ones, and photographs of it say more than an empty product
 * grid does. Laid out in CSS columns so portrait and landscape frames pack
 * against each other at their own heights instead of being cropped square.
 */
export function CategoryGallery({ gallery }: { gallery: NonNullable<Category["gallery"]> }) {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 max-w-2xl">
          <h2 className="mb-4 font-heading text-3xl leading-[1] lg:text-4xl">
            {gallery.heading}
          </h2>
          <p className="leading-relaxed text-muted-foreground">{gallery.body}</p>
        </div>

        <div className="columns-2 gap-3 md:columns-3 lg:gap-4">
          {gallery.items.map((item) => (
            <figure
              key={item.src}
              className="mb-3 break-inside-avoid overflow-hidden bg-muted lg:mb-4"
            >
              {item.kind === "video" ? (
                <ProcessVideo
                  src={item.src}
                  poster={item.poster}
                  label={item.label}
                  className="h-auto w-full"
                />
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={800}
                  height={1000}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 380px"
                  className="h-auto w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
