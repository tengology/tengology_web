"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useProductFocus } from "./ProductFocusContext";
import { birthstoneMonthForImage } from "@/lib/birthstones";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  id: string;
  url: string;
  altText: string | null;
}

/**
 * Product gallery: the large frame shows the selected shot, thumbnails
 * switch it, and clicking the large frame opens a full-size lightbox.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // On a made-to-order product the options drive the gallery: choosing a
  // birthstone puts that strand in the frame and narrows the strip below to
  // that stone alone, and choosing an initial we have photographed on it swaps
  // the frame again for the finished piece.
  const focus = useProductFocus();
  const focusUrl = focus?.focusUrl ?? null;
  const focusMonth = focus?.focusMonth ?? null;

  const shown = useMemo(() => {
    if (focusMonth == null) return images;
    const matching = images.filter(
      (img) => birthstoneMonthForImage(img.url) === focusMonth
    );
    // A stone we have barely shot yet should not empty the gallery.
    return matching.length > 0 ? matching : images;
  }, [images, focusMonth]);

  // Re-point at the chosen shot whenever the choice or the filtered set moves.
  useEffect(() => {
    if (!focusUrl) return;
    const i = shown.findIndex((img) => img.url === focusUrl);
    setActive(i >= 0 ? i : 0);
  }, [focusUrl, shown]);

  const count = shown.length;
  const safe = Math.min(active, Math.max(count - 1, 0));
  const step = (delta: number) => setActive((i) => (i + delta + count) % count);

  // Arrow keys page through the lightbox.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, count]);

  if (count === 0) {
    return (
      <div className="flex aspect-square items-center justify-center bg-muted">
        <span className="font-heading text-6xl text-muted-foreground/20">T</span>
      </div>
    );
  }

  const current = shown[safe];

  return (
    <div className="space-y-3">
      {/* Main frame */}
      <div className="group relative aspect-square overflow-hidden bg-muted">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`View ${title} full size`}
          className="absolute inset-0 h-full w-full cursor-zoom-in"
        >
          <Image
            key={current.id}
            src={current.url}
            alt={current.altText || title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center bg-background/90 opacity-0 transition-opacity group-hover:opacity-100 lg:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center bg-background/90 opacity-0 transition-opacity group-hover:opacity-100 lg:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="eyebrow absolute bottom-3 right-3 bg-background/90 px-2 py-1">
              {safe + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails — every shot in view, narrowed to the chosen stone */}
      {count > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {shown.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${count}`}
              aria-current={i === safe ? "true" : undefined}
              className={cn(
                "relative aspect-square overflow-hidden bg-muted transition-opacity",
                i === safe
                  ? "ring-1 ring-foreground"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={img.altText || title}
                fill
                sizes="(max-width: 1024px) 25vw, 12vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="h-dvh max-w-[100vw] gap-0 border-0 bg-background/98 p-0 sm:max-w-[100vw]">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div className="relative h-full w-full">
            <Image
              key={current.id}
              src={current.url}
              alt={current.altText || title}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-background/90"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-background/90"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <span className="eyebrow absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/90 px-3 py-1.5">
                  {safe + 1} / {count}
                </span>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
