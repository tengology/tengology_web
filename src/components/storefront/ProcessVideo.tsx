"use client";

import { useEffect, useRef } from "react";

interface ProcessVideoProps {
  src: string;
  poster: string;
  /** Describes the clip for assistive tech, the same way alt text would. */
  label: string;
  className?: string;
}

/**
 * Silent, looping process clip used in place of a still in the story chapters.
 * Autoplay only ever happens muted and inline, and playback is tied to
 * visibility via IntersectionObserver so an offscreen clip costs nothing.
 * Reduced-motion users never get playback — they keep the poster still, which
 * is why every caller passes a poster worth looking at on its own.
 */
export function ProcessVideo({
  src,
  poster,
  label,
  className,
}: ProcessVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // React does not always reflect the muted attribute onto the DOM property,
    // and an unmuted video is refused autoplay outright.
    el.muted = true;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    if (typeof IntersectionObserver === "undefined") {
      void el.play().catch(() => {});
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Autoplay can still be refused (e.g. Low Power Mode); the poster stays.
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
