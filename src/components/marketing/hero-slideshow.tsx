"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { heroSlides } from "@/lib/site-content";

const INTERVAL_MS = 3000;

export function HeroSlideshow() {
  const count = heroSlides.length;
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const frames = count > 0 ? [...heroSlides, heroSlides[0]] : [];

  const showNext = useCallback(() => {
    setIndex((current) => (current >= count ? current : current + 1));
  }, [count]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const id = window.setInterval(showNext, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [showNext]);

  useLayoutEffect(() => {
    if (animate || index !== 0) return;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAnimate(true));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [animate, index]);

  function handleTransitionEnd(event: React.TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (index !== count) return;
    setAnimate(false);
    setIndex(0);
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Studio photos"
    >
      <div className="relative aspect-[703/426] overflow-hidden bg-brand-dark/10">
        <div
          className={`absolute inset-0 flex motion-reduce:transition-none ${
            animate ? "transition-transform duration-700 ease-out" : ""
          }`}
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {frames.map((slide, slideIndex) => (
            <div key={`${slide.src}-${slideIndex}`} className="h-full w-full shrink-0 grow-0 basis-full">
              {/* Native img keeps the full-bleed crop and avoids next/image layout quirks. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                draggable={false}
                fetchPriority={slideIndex === 0 ? "high" : "low"}
                className="h-full w-full object-cover"
                style={{ objectPosition: slide.objectPosition }}
                aria-hidden={slideIndex !== index}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
