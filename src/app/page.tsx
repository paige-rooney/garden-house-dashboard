import Link from "next/link";
import { ContactForm } from "@/components/marketing/contact-form";
import { HeroSlideshow } from "@/components/marketing/hero-slideshow";
import { InstagramIconLink } from "@/components/marketing/instagram-icon-link";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";
import { Section } from "@/components/marketing/section";
import { ServiceArchGrid } from "@/components/marketing/service-arch-grid";
import { TopNav } from "@/components/marketing/top-nav";
import { site, testimonials } from "@/lib/site-content";

export default function Page() {
  return (
    <div>
      <TopNav />
      <HeroSlideshow />

      <section className="bg-brand-green">
        <div className="flex flex-col items-center gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10 md:py-12">
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-2xl font-semibold text-white md:text-3xl">{site.tagline}</h2>
            <div className="mb-5 mt-2 h-px w-16 bg-white/70" aria-hidden />
            <p className="max-w-3xl font-sans text-sm leading-relaxed text-white/90">{site.about}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/services"
                className="rounded-lg bg-brand-bg px-4 py-2 font-alta text-sm tracking-wide text-brand-green"
              >
                Explore Services
              </Link>
              <Link
                href="/contact"
                className="rounded-lg border border-white/40 px-4 py-2 font-alta text-sm tracking-wide text-white"
              >
                Get In Touch
              </Link>
            </div>
          </div>
          {/* Native img keeps the lockup sharp on the green band. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-lockup.png"
            alt=""
            width={819}
            height={1024}
            draggable={false}
            className="h-auto w-[11.5rem] shrink-0 sm:w-[13.5rem] md:w-[15rem] lg:w-[16.5rem]"
            aria-hidden
          />
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8">
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
          <div className="mb-4 flex items-center gap-3">
            <p className="font-sans text-sm text-brand-muted">Looking forward to connecting with you!</p>
            <InstagramIconLink />
          </div>
          <ContactForm />
        </Section>
      </main>
    </div>
  );
}
