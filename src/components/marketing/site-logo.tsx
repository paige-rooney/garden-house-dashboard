import Link from "next/link";
import type { Route } from "next";

export function SiteLogo() {
  return (
    <Link href={"/" as Route} className="flex items-center gap-2.5 text-white md:gap-3">
      {/* Native img so the cream lockup stays sharp on the green bar. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-header.png"
        alt=""
        width={642}
        height={870}
        draggable={false}
        className="h-11 w-auto shrink-0 md:h-12"
        aria-hidden
      />
      <span className="block">
        <span className="block whitespace-nowrap font-heading text-[1.35rem] font-normal leading-none tracking-[0.12em]">
          GARDEN HOUSE
        </span>
        <span className="mt-1.5 block whitespace-nowrap font-heading text-[0.55rem] font-normal uppercase leading-none tracking-[0.34em] text-white/90">
          RECORDING STUDIOS
        </span>
      </span>
    </Link>
  );
}
