"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { services } from "@/lib/site-content";

const ARCH_HEIGHT = "min-h-[19.5rem] sm:min-h-[21rem]";

export function ServiceArchGrid() {
  return (
    <ul className="mx-auto grid w-full justify-center justify-items-center gap-6 [grid-template-columns:minmax(0,13.5rem)] sm:[grid-template-columns:repeat(2,minmax(0,13.5rem))] sm:gap-5 lg:[grid-template-columns:repeat(4,minmax(0,13.5rem))]">
      {services.map((service, index) => (
        <ServiceArch key={service.name} service={service} index={index} />
      ))}
    </ul>
  );
}

function ServiceArch({
  service,
  index,
}: {
  service: (typeof services)[number];
  index: number;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(index === 0);

  useEffect(() => {
    if (index === 0) return;

    const el = ref.current;
    if (!el) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);

    const frame = window.requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40 && rect.bottom > 80) {
        setVisible(true);
        observer.disconnect();
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [index]);

  return (
    <li
      ref={ref}
      className={`flex w-full max-w-[13.5rem] transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
      style={{ transitionDelay: visible ? `${index * 110}ms` : "0ms" }}
    >
      <article
        className={`relative flex w-full ${ARCH_HEIGHT} flex-col overflow-hidden rounded-t-[999px] border border-brand-green/25 shadow-soft`}
      >
        <Image
          src={service.image}
          alt={service.imageAlt}
          fill
          sizes="216px"
          className="object-cover"
          style={{ objectPosition: service.objectPosition }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-brand-green via-brand-green/50 to-transparent"
          aria-hidden
        />
        <div
          className={`relative z-10 flex ${ARCH_HEIGHT} flex-col items-center justify-end px-3 pb-6 pt-12 text-center`}
        >
          <h3 className="max-w-[10.5rem] font-heading text-base font-semibold leading-snug text-white">
            {service.name}
          </h3>
          <p className="mt-2 max-w-[11rem] font-sans text-xs leading-relaxed text-white/90">
            {service.description}
          </p>
        </div>
      </article>
    </li>
  );
}
