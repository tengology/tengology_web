import Image from "next/image";
import { ProcessVideo } from "./ProcessVideo";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/taxonomy";

/**
 * The block that opens a material family's page: what the craft is, next to a
 * still or a process clip of it being made.
 *
 * Media aspect comes from the taxonomy rather than a fixed frame, so a portrait
 * phone clip stays portrait instead of being cropped to a landscape letterbox.
 */
export function CategoryStory({ category }: { category: Category }) {
  const { media, intro, label } = category;

  // A tall clip beside a column of text would tower over it; cap the width so
  // the two sides stay in proportion.
  const [w, h] = media.aspect.split("/").map(Number);
  const isTall = h / w > 1.3;

  return (
    <section className="border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div
              style={{ aspectRatio: media.aspect }}
              className={cn(
                "relative overflow-hidden bg-muted",
                isTall && "mx-auto w-full max-w-[20rem] lg:mx-0"
              )}
            >
              {media.kind === "video" ? (
                <ProcessVideo
                  src={media.src}
                  poster={media.poster}
                  label={media.label}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={media.src}
                  alt={media.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover"
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="eyebrow mb-4">{label}</p>
            <h2 className="mb-6 font-heading text-4xl leading-[0.95] lg:text-5xl">
              {intro.heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">{intro.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
