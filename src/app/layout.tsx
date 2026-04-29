import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://cifra.co";
const siteDescription =
  "Operator, strategist, and investor based in Bratislava. I work with founders and boards across Central Europe on strategy, leadership transitions, and scaling technology businesses through inflection points.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jan Cifra · Operator · Strategist · Investor",
    template: "%s · Jan Cifra",
  },
  description: siteDescription,
  authors: [{ name: "Jan Cifra", url: siteUrl }],
  creator: "Jan Cifra",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Jan Cifra",
    title: "Jan Cifra · Operator · Strategist · Investor",
    description: siteDescription,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jan Cifra · Operator · Strategist · Investor",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
