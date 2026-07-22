import "./globals.css";
import { ReactNode } from "react";
import { site } from "@/lib/site-content";

export const metadata = {
  title: site.name,
  description: site.about,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
