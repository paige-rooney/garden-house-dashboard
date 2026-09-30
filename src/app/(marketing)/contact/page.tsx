import { ContactForm } from "@/components/marketing/contact-form";
import { InstagramIconLink } from "@/components/marketing/instagram-icon-link";
import { Section } from "@/components/marketing/section";
import { TopNav } from "@/components/marketing/top-nav";
import { site } from "@/lib/site-content";

export default function ContactPage() {
  return (
    <div>
      <TopNav />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Section title="Get In Touch">
          <div className="mb-4 flex items-center gap-3">
            <p className="text-sm text-brand-muted">Looking forward to connecting with you!</p>
            <InstagramIconLink />
          </div>
          <div className="mb-4 space-y-1 text-sm text-brand-muted">
            <p>
              Email:{" "}
              <a href={`mailto:${site.email}`} className="text-brand-green underline">
                {site.email}
              </a>
            </p>
            <p>
              Instagram:{" "}
              <a
                href={site.instagramUrl}
                className="text-brand-green underline"
                target="_blank"
                rel="noreferrer"
              >
                @{site.instagram}
              </a>
            </p>
            <p>Location: {site.location}</p>
          </div>
          <ContactForm />
        </Section>
      </main>
    </div>
  );
}

