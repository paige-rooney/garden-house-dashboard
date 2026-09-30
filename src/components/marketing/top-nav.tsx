import { SiteLogo } from "@/components/marketing/site-logo";
import Link from "next/link";
import type { Route } from "next";

const links = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story" },
  { href: "/services", label: "Services" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
] as const;

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 bg-brand-green">
      <nav className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-3 md:flex-row md:items-center md:justify-between md:gap-6 md:py-4">
        <SiteLogo />
        <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-alta text-[0.65rem] uppercase tracking-[0.16em] md:justify-end md:gap-x-4 md:text-xs md:tracking-[0.18em]">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href as Route} className="text-white hover:text-white/80">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
