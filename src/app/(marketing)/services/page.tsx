import Link from "next/link";
import { Section } from "@/components/marketing/section";
import { ServiceArchGrid } from "@/components/marketing/service-arch-grid";
import { TopNav } from "@/components/marketing/top-nav";

export default function ServicesPage() {
  return (
    <div>
      <TopNav />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Section title="Services">
          <ServiceArchGrid />
          <p className="mt-4 text-sm text-brand-muted">
            Looking for upcoming community sessions?{" "}
            <Link href="/events" className="text-brand-green underline">
              Visit the events page
            </Link>{" "}
            or follow{" "}
            <a
              href="https://instagram.com/gardenhouse_recordingstudios"
              className="text-brand-green underline"
              target="_blank"
              rel="noreferrer"
            >
              @gardenhouse_recordingstudios
            </a>
            .
          </p>
        </Section>
      </main>
    </div>
  );
}
