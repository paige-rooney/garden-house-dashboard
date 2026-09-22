"use client";

import { useCallback, useEffect, useState } from "react";
import { heroSlides } from "@/lib/site-content";

const INTERVAL_MS = 5500;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = heroSlides.length;

  const goTo = useCallback((next: number) => {
    setIndex(((next % count) + count) % count);
  }, [count]);

  const showNext = useCallback(() => {
    setIndex((current) => (current + 1) % count);
  }, [count]);

  useEffect(() => {
    if (paused) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const id = window.setInterval(showNext, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, showNext]);

  return (
    <section
      className="relative overflow-hidden rounded-2xl shadow-soft"
      aria-roledescription="carousel"
      aria-label="Studio photos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[703/426] overflow-hidden bg-brand-dark/10">
        <div
          className="absolute bottom-0 left-0 top-0 flex transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{
            width: `${count * 100}%`,
            transform: `translateX(-${index * (100 / count)}%)`,
          }}
        >
          {heroSlides.map((slide, slideIndex) => (
            <div key={slide.src} className="h-full shrink-0" style={{ width: `${100 / count}%` }}>
              {/* Native img so frames stay at the slideshow’s aspect without next/image layout quirks. */}
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

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-brand-dark/25 px-2 py-1.5">
        {heroSlides.map((slide, slideIndex) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show photo ${slideIndex + 1}`}
            aria-current={slideIndex === index ? true : undefined}
            className={`h-2.5 w-2.5 rounded-full ${
              slideIndex === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
            }`}
            onClick={() => goTo(slideIndex)}
          />
        ))}
      </div>
    </section>
  );
}
