import { Section } from "@/components/marketing/section";
import { TopNav } from "@/components/marketing/top-nav";
import { ourStory, site } from "@/lib/site-content";

export default function OurStoryPage() {
  return (
    <div>
      <TopNav />
      <main className="mx-auto grid max-w-4xl gap-6 px-6 py-8">
        <section className="rounded-2xl bg-brand-green p-8 text-white shadow-soft">
          <p className="font-alta text-sm uppercase tracking-[0.28em] text-white/80">Our Story</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">Get to Know Us</h1>
          <p className="mt-2 font-sans text-white/85">{site.tagline}</p>
        </section>

        <Section title="Our Mission">
          <p className="font-sans text-sm leading-relaxed text-brand-dark">{ourStory.mission}</p>
        </Section>

        <Section title="Our Values">
          <ul className="grid gap-4 md:grid-cols-3">
            {ourStory.values.map((value) => (
              <li key={value.name} className="rounded-xl border border-brand-green/15 bg-brand-bg/60 p-4">
                <h3 className="font-heading text-xl text-brand-green">{value.name}</h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-brand-muted">{value.description}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="What we do">
          {ourStory.whatWeDo.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="mb-3 font-sans text-sm leading-relaxed text-brand-dark last:mb-0">
              {paragraph}
            </p>
          ))}
        </Section>

        <Section title="Meet the Founder">
          <p className="font-alta text-sm tracking-wide text-brand-rust">
            {ourStory.founder.name} · {ourStory.founder.role}
          </p>
          <p className="mt-3 font-sans text-sm leading-relaxed text-brand-dark">{ourStory.founder.bio}</p>
        </Section>
      </main>
    </div>
  );
}
