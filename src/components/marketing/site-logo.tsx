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
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/70">
          {site.shortName}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">Recording Studios</p>
      </div>
    );
  }

  return (
    <Link href={"/" as Route} className="leading-tight text-brand-dark">
      <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.22em]">
        {site.shortName}
      </span>
      <span className="block text-base font-semibold">Recording Studios</span>
    </Link>
  );
}
