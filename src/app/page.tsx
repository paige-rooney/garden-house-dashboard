import Link from "next/link";
import { ContactForm } from "@/components/marketing/contact-form";
import { Section } from "@/components/marketing/section";
import { ServiceArchGrid } from "@/components/marketing/service-arch-grid";
import { SiteLogo } from "@/components/marketing/site-logo";
import { TopNav } from "@/components/marketing/top-nav";
import { portfolio, site, testimonials } from "@/lib/site-content";

export default function Page() {
  return (
    <div>
      <TopNav />
      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8">
        <section className="rounded-2xl bg-brand-green p-8 text-white shadow-soft">
          <SiteLogo variant="hero" />
          <h1 className="mt-4 text-4xl font-semibold">{site.tagline}</h1>
          <p className="mt-3 max-w-3xl text-white/80">{site.about}</p>
          <div className="mt-5 flex gap-3">
            <Link
              href="/services"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-brand-dark"
            >
              Explore Services
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white"
            >
              Get In Touch
            </Link>
          </div>
        </section>

        <Section title="Services">
          <ServiceArchGrid />
        </Section>

        <Section title="Portfolio">
          <p className="mb-3 text-sm text-brand-muted">
            Selected credits — more projects coming soon.
          </p>
          <ul className="grid gap-2">
            {portfolio.map((item) => (
              <li key={item.id} className="rounded-lg border border-brand-green/20 p-3 text-sm">
                <strong>{item.artist}</strong> — {item.projectTitle} ({item.service})
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Testimonials">
          <ul className="grid gap-3 md:grid-cols-2">
            {testimonials.map((item) => (
              <li key={item.id} className="rounded-lg border border-brand-green/20 p-4">
                <p className="text-sm italic">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-2 text-sm font-medium">{item.name}</p>
                <p className="text-xs text-brand-muted">{item.role}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Get In Touch">
          <p className="mb-4 text-sm text-brand-muted">Looking forward to connecting with you!</p>
          <ContactForm />
        </Section>
      </main>
    </div>
  );
}
