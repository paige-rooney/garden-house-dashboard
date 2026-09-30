import { Instagram } from "lucide-react";
import { site } from "@/lib/site-content";

type Props = {
  className?: string;
};

export function InstagramIconLink({ className = "" }: Props) {
  return (
    <a
      href={site.instagramUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Garden House on Instagram"
      className={`inline-flex text-brand-green transition-colors hover:text-brand-green/80 ${className}`}
    >
      <Instagram className="h-6 w-6" strokeWidth={1.75} aria-hidden />
    </a>
  );
}
