import "./globals.css";
import { ReactNode } from "react";
import { Bona_Nova, Lora, Playfair_Display } from "next/font/google";
import { site } from "@/lib/site-content";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const bonaNova = Bona_Nova({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-secondary",
  display: "swap",
});

export const metadata = {
  title: site.name,
  description: site.about,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lora.variable} ${bonaNova.variable}`}>
      <body>{children}</body>
    </html>
  );
}
