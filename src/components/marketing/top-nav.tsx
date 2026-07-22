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
    <header className="sticky top-0 z-50 border-b border-brand-green/10 bg-brand-bg/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <SiteLogo />
        <ul className="flex items-center gap-4 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href as Route} className="text-brand-dark hover:text-brand-green">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
