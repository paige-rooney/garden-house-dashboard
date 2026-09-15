import Link from "next/link";
import type { Route } from "next";
import { site } from "@/lib/site-content";

type Props = {
  variant?: "nav" | "hero";
};

export function SiteLogo({ variant = "nav" }: Props) {
  if (variant === "hero") {
    return (
      <div>
        <p className="font-alta text-sm uppercase tracking-[0.28em] text-brand-gold">
          {site.shortName}
        </p>
        <p className="mt-1 font-heading text-2xl font-semibold tracking-tight">Recording Studios</p>
      </div>
    );
  }

  return (
    <Link href={"/" as Route} className="leading-tight text-brand-dark">
      <span className="block font-alta text-[0.65rem] uppercase tracking-[0.22em] text-brand-green">
        {site.shortName}
      </span>
      <span className="block font-heading text-base font-semibold">Recording Studios</span>
    </Link>
  );
}
