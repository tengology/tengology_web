"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  url: string;
  altText: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  title: string;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
}

export function ProductGallery({
  images,
  title,
  activeIndex,
  onActiveIndexChange,
}: ProductGalleryProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const controlled = activeIndex !== undefined;
  const currentIndex = controlled ? activeIndex : internalIndex;

  const trackRef = useRef<HTMLDivElement>(null);
  /** Index of a programmatic smooth-scroll in flight — observer echoes are ignored until it lands. */
  const pendingScrollIndex = useRef<number | null>(null);
  /** Last slide index the observer reported as visible. */
  const visibleIndexRef = useRef(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxStartIndex = useRef(0);
  const [lightboxTrack, setLightboxTrack] = useState<HTMLDivElement | null>(
    null,
  );

  const setIndex = (i: number) => {
    if (controlled) {
      onActiveIndexChange?.(i);
    } else {
      setInternalIndex(i);
    }
  };
  const setIndexRef = useRef(setIndex);
  useEffect(() => {
    setIndexRef.current = setIndex;
  });

  const count = images.length;
  const safeIndex = Math.min(Math.max(currentIndex, 0), Math.max(count - 1, 0));

  // Controlled index (variant selection, thumbnail click) → scroll the track.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || count === 0) return;
    if (safeIndex === visibleIndexRef.current) return;
    pendingScrollIndex.current = safeIndex;
    track.scrollTo({
      left: safeIndex * track.clientWidth,
      behavior: "smooth",
    });
  }, [safeIndex, count]);

  // Swipe → IntersectionObserver per slide updates the index.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || count === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (Number.isNaN(index)) continue;
          visibleIndexRef.current = index;
          if (pendingScrollIndex.current !== null) {
            // Programmatic scroll in flight — don't echo back into state.
            if (index === pendingScrollIndex.current) {
              pendingScrollIndex.current = null;
            }
            continue;
          }
          setIndexRef.current(index);
        }
      },
      { root: track, threshold: 0.6 },
    );
    Array.from(track.children).forEach((slide) => observer.observe(slide));

    // User interaction cancels any in-flight programmatic scroll guard.
    const clearPending = () => {
      pendingScrollIndex.current = null;
    };
    track.addEventListener("pointerdown", clearPending, { passive: true });
    track.addEventListener("wheel", clearPending, { passive: true });

    return () => {
      observer.disconnect();
      track.removeEventListener("pointerdown", clearPending);
      track.removeEventListener("wheel", clearPending);
    };
  }, [count]);

  // Lightbox: jump to the opening slide, then track swipes for the counter.
  useEffect(() => {
    if (!lightboxTrack) return;
    lightboxTrack.scrollTo({
      left: lightboxStartIndex.current * lightboxTrack.clientWidth,
    });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(index)) setLightboxIndex(index);
        }
      },
      { root: lightboxTrack, threshold: 0.6 },
    );
    Array.from(lightboxTrack.children).forEach((slide) =>
      observer.observe(slide),
    );
    return () => observer.disconnect();
  }, [lightboxTrack]);

  if (count === 0) {
    return (
      <div className="flex aspect-square items-center justify-center bg-muted">
        <span className="font-heading text-6xl text-muted-foreground/20">T</span>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    lightboxStartIndex.current = index;
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const scrollByOne = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  };

  const scrollLightboxByOne = (direction: -1 | 1) => {
    if (!lightboxTrack) return;
    lightboxTrack.scrollBy({
      left: direction * lightboxTrack.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-4">
      <div className="group relative">
        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          aria-label={`${title} — image gallery`}
        >
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              data-index={index}
              onClick={() => openLightbox(index)}
              aria-label={`Open image ${index + 1} of ${count} in fullscreen`}
              className="relative aspect-square w-full shrink-0 cursor-zoom-in snap-center bg-muted focus:outline-none"
            >
              <Image
                src={img.url}
                alt={img.altText || title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                preload={index === 0}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollByOne(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center border bg-background/90 opacity-0 transition-opacity duration-200 hover:bg-background focus-visible:opacity-100 group-hover:opacity-100 lg:flex"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByOne(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center border bg-background/90 opacity-0 transition-opacity duration-200 hover:bg-background focus-visible:opacity-100 group-hover:opacity-100 lg:flex"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      {/* Mobile dot indicators */}
      {count > 1 && (
        <div className="flex justify-center gap-1.5 lg:hidden" aria-hidden>
          {images.map((img, index) => (
            <span
              key={img.id}
              className={cn(
                "h-1.5 transition-all duration-300",
                index === safeIndex
                  ? "w-4 bg-foreground"
                  : "w-1.5 bg-foreground/20",
              )}
            />
          ))}
        </div>
      )}

      {/* Desktop thumbnails */}
      {count > 1 && (
        <div className="hidden grid-cols-4 gap-3 lg:grid">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === safeIndex}
              className={cn(
                "relative aspect-square overflow-hidden border bg-muted transition-opacity duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                index === safeIndex
                  ? "border-foreground"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.url}
                alt={img.altText || title}
                fill
                sizes="12vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog
        open={lightboxOpen}
        onOpenChange={(open: boolean) => setLightboxOpen(open)}
      >
        <DialogContent className="left-0 top-0 h-dvh w-screen max-w-[100vw] translate-x-0 translate-y-0 gap-0 rounded-none bg-background/98 p-0 ring-0">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div
            ref={setLightboxTrack}
            className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
          >
            {images.map((img, index) => (
              <div
                key={img.id}
                data-index={index}
                className="relative h-full w-full shrink-0 snap-center"
              >
                <Image
                  src={img.url}
                  alt={img.altText || title}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            ))}
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => scrollLightboxByOne(-1)}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center border bg-background/90 transition-opacity hover:bg-background lg:flex"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollLightboxByOne(1)}
                aria-label="Next image"
                className="absolute right-4 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center border bg-background/90 transition-opacity hover:bg-background lg:flex"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          )}

          <p className="eyebrow absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 text-foreground">
            {lightboxIndex + 1} / {count}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
