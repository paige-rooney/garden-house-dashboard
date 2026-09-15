import Image from "next/image";
import { services } from "@/lib/site-content";

export function ServiceArchGrid() {
  return (
    <ul className="grid grid-cols-2 justify-items-center gap-4 sm:gap-5 lg:grid-cols-4">
      {services.map((service) => (
        <li key={service.name} className="flex w-full max-w-[13.5rem]">
          <article className="relative flex min-h-[22rem] w-full flex-col overflow-hidden rounded-t-[999px] border border-brand-green/25 border-b-brand-gold/50 shadow-soft sm:min-h-[24rem]">
            <Image
              src={service.image}
              alt={service.imageAlt}
              fill
              sizes="(max-width: 1024px) 45vw, 180px"
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-brand-green via-brand-green/80 to-brand-green/20"
              aria-hidden
            />
            <div className="relative z-10 flex min-h-[22rem] flex-col items-center justify-end px-3 pb-7 pt-16 text-center sm:min-h-[24rem]">
              <h3 className="max-w-[10.5rem] font-heading text-base font-semibold leading-snug text-white">
                {service.name}
              </h3>
              <p className="mt-2 max-w-[11rem] font-sans text-xs leading-relaxed text-white/90">
                {service.description}
              </p>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
