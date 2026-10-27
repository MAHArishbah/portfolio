import type { Metadata } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { fullName, profile } from "@/content/profile";
import "./globals.css";

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${fullName} — ${profile.roleLine}`,
  description: profile.blurb,
  openGraph: {
    title: fullName,
    description: profile.blurb,
    type: "profile",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${serif.variable} ${mono.variable} font-sans antialiased`}
      >
        {/* Scroll reveals start at opacity 0; without JS they would never
            un-hide, so the content is pinned visible instead. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;animation:none!important}`}</style>
        </noscript>
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
