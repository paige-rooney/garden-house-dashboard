import Link from "next/link";
import { ContactForm } from "@/components/marketing/contact-form";
import { HeroSlideshow } from "@/components/marketing/hero-slideshow";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";
import { Section } from "@/components/marketing/section";
import { ServiceArchGrid } from "@/components/marketing/service-arch-grid";
import { TopNav } from "@/components/marketing/top-nav";
import { site, testimonials } from "@/lib/site-content";

export default function Page() {
  return (
    <div>
      <TopNav />
      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8">
        <HeroSlideshow />

        <Section title={site.tagline}>
          <p className="max-w-3xl font-sans text-sm leading-relaxed text-brand-dark">{site.about}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="rounded-lg bg-brand-green px-4 py-2 font-alta text-sm tracking-wide text-white"
            >
              Explore Services
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-brand-green/30 px-4 py-2 font-alta text-sm tracking-wide text-brand-dark"
            >
              Get In Touch
            </Link>
          </div>
        </Section>

        <Section title="Services">
          <ServiceArchGrid />
        </Section>

        <Section title="Portfolio">
          <p className="mb-5 font-sans text-sm text-brand-muted">Selected credits — more projects coming soon.</p>
          <PortfolioGrid />
        </Section>

        <Section title="Testimonials">
          <ul className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <li key={item.id} className="rounded-xl border border-brand-green/20 bg-brand-bg/50 p-5">
                <p className="font-heading text-3xl leading-none text-brand-green">&ldquo;</p>
                <p className="font-sans text-sm leading-relaxed text-brand-dark">{item.quote}</p>
                <p className="mt-4 font-alta text-sm tracking-wide text-brand-rust">
                  {item.name}
                  {item.role ? ` · ${item.role}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Get In Touch">
          <p className="mb-4 font-sans text-sm text-brand-muted">Looking forward to connecting with you!</p>
          <ContactForm />
        </Section>
      </main>
    </div>
  );
}
