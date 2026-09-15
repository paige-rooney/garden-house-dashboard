import Image from "next/image";
import { portfolio } from "@/lib/site-content";

export function PortfolioGrid() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {portfolio.map((item) => (
        <li key={item.id} className="text-center">
          <div className="relative aspect-square overflow-hidden rounded-sm border border-brand-green/15 shadow-soft">
            <Image
              src={item.cover}
              alt={`${item.projectTitle} by ${item.artist}`}
              fill
              sizes="(max-width: 1024px) 50vw, 220px"
              className="object-cover"
            />
          </div>
          <h3 className="mt-3 font-heading text-lg leading-snug text-brand-dark">{item.projectTitle}</h3>
          <p className="mt-1 font-alta text-sm tracking-wide text-brand-muted">{item.artist}</p>
          <div className="mt-3 flex justify-center gap-3 text-xs font-alta tracking-wide">
            <a
              href={item.spotifyUrl}
              className="text-brand-rust underline decoration-brand-rust/40 underline-offset-4 hover:decoration-brand-rust"
              target="_blank"
              rel="noreferrer"
            >
              Spotify
            </a>
            {item.appleMusicUrl && (
              <a
                href={item.appleMusicUrl}
                className="text-brand-blue underline decoration-brand-blue/40 underline-offset-4 hover:decoration-brand-blue"
                target="_blank"
                rel="noreferrer"
              >
                Apple Music
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
