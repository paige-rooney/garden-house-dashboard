import Image from "next/image";
import { services } from "@/lib/site-content";

export function ServiceArchGrid() {
  return (
    <ul className="grid grid-cols-1 items-end gap-6 md:grid-cols-3 md:gap-5">
      {services.map((service) => (
        <li key={service.name} className="flex">
          <article className="relative flex w-full min-h-[19rem] flex-col overflow-hidden rounded-t-[5.5rem] border border-brand-green/25 border-b-brand-green/40 shadow-soft sm:min-h-[20rem] sm:rounded-t-[6.5rem]">
            <Image
              src={service.image}
              alt={service.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-brand-green/95 via-brand-green/75 to-brand-green/25"
              aria-hidden
            />
            <div className="relative z-10 flex min-h-[19rem] flex-col items-center justify-end px-5 pb-8 pt-16 text-center sm:min-h-[20rem] sm:pt-20">
              <h3 className="max-w-[12rem] font-semibold leading-snug text-white">
                {service.name}
              </h3>
              <p className="mt-3 max-w-[14rem] text-sm leading-relaxed text-white/90">
                {service.description}
              </p>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
