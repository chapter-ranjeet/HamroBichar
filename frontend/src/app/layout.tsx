import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import Footer from "@/components/Footer";
import LanguageProvider from "@/components/LanguageProvider";
import Navbar from "@/components/Navbar";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/i18n";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hamrobichar.app";
const gaId = "G-STF3X2B450";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HamroBichar | Nepal News & Views",
    template: "%s | HamroBichar"
  },
  description: "HamroBichar brings you timely Nepal news, politics, education, business, and technology updates.",
  applicationName: "HamroBichar",
  keywords: [
    "HamroBichar",
    "Nepal news",
    "Nepali news",
    "latest Nepal news",
    "breaking Nepal news",
    "Nepal headlines",
    "Nepal politics news",
    "Nepal business news",
    "Nepal education news",
    "Nepal technology news",
    "Kathmandu news",
    "Nepali online news portal",
    "Nepal current affairs",
    "Nepal economy updates",
    "Nepal live updates",
    "Politics",
    "Education",
    "Business",
    "Technology"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "HamroBichar",
    title: "HamroBichar | Nepal News & Views",
    description: "HamroBichar brings you timely Nepal news, politics, education, business, and technology updates.",
    locale: "en_US",
    images: [
      {
        url: "/HBLogo2.png",
        width: 512,
        height: 512,
        alt: "HamroBichar"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "HamroBichar | Nepal News & Views",
    description: "HamroBichar brings you timely Nepal news, politics, education, business, and technology updates.",
    images: ["/HBLogo2.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" }
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/HBLogo2.png", sizes: "180x180", type: "image/png" }]
  },
  category: "news"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLanguage = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-STF3X2B450"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-STF3X2B450');
          `}
        </Script>
        <LanguageProvider initialLanguage={initialLanguage}>
          <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#fff1f2,#f8fafc_42%,#ffffff)]">
            <Navbar />
            <main className="w-full flex-1 px-4 sm:px-6 lg:px-10">{children}</main>
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
