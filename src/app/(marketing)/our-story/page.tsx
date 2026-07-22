import { Section } from "@/components/marketing/section";
import { TopNav } from "@/components/marketing/top-nav";
import { ourStory, site } from "@/lib/site-content";

export default function OurStoryPage() {
  return (
    <div>
      <TopNav />
      <main className="mx-auto grid max-w-4xl gap-6 px-6 py-8">
        <section className="rounded-2xl bg-brand-surface p-6 shadow-soft">
          <h1 className="text-2xl font-semibold">Get to Know Us</h1>
          <p className="mt-2 text-sm text-brand-muted">{site.tagline}</p>
        </section>

        <Section title="Background">
          <p className="text-sm text-brand-muted">{ourStory.background}</p>
        </Section>

        <Section title="Core values">
          <ul className="list-disc space-y-2 pl-6 text-sm text-brand-muted">
            {ourStory.values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </Section>

        <Section title="What we are about">
          <p className="text-sm text-brand-muted">{site.about}</p>
          <p className="mt-3 text-sm text-brand-muted">{ourStory.mission}</p>
        </Section>
      </main>
    </div>
  );
}
