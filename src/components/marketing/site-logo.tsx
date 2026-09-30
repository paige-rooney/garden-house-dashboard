import Link from "next/link";
import type { Route } from "next";

export function SiteLogo() {
  return (
    <Link href={"/" as Route} className="block text-white">
      <span className="block whitespace-nowrap font-heading text-[1.35rem] font-normal leading-none tracking-[0.12em]">
        GARDEN HOUSE
      </span>
      <span className="mt-1.5 block whitespace-nowrap font-heading text-[0.55rem] font-normal uppercase leading-none tracking-[0.34em] text-white/90">
        RECORDING STUDIOS
      </span>
    </Link>
  );
}
