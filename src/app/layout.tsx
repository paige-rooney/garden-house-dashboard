import "./globals.css";
import { ReactNode } from "react";
import { Belleza, Lora, Playfair_Display } from "next/font/google";
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

const belleza = Belleza({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-secondary",
  display: "swap",
});

export const metadata = {
  title: site.name,
  description: site.about,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lora.variable} ${belleza.variable}`}>
      <body>{children}</body>
    </html>
  );
}
