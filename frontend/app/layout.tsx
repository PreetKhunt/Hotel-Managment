import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hospitality Hub — Luxury Hotel Management",
  description: "Experience luxury redefined. Hospitality Hub offers world-class rooms, premium amenities, and exceptional service for an unforgettable stay.",
  keywords: "luxury hotel, hotel booking, premium rooms, spa, restaurant, hospitality",
  openGraph: {
    title: "Hospitality Hub — Luxury Hotel Management",
    description: "Experience luxury redefined at Hospitality Hub.",
    type: "website",
  },
};

import { Providers } from "./providers";
import BackToHomeButton from "@/components/shared/BackToHomeButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full`} data-scroll-behavior="smooth">
      <body className="min-h-full antialiased" style={{ background: '#0A0F1E', color: '#F8FAFC' }}>
        <Providers>
          {children}
          <BackToHomeButton />
        </Providers>
      </body>
    </html>
  );
}
