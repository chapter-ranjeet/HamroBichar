import type { Metadata } from "next";
import { cookies } from "next/headers";

import { getDictionary, LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Contact HamroBichar | Get in Touch",
  description:
    "Contact HamroBichar for collaborations, corrections, and publishing inquiries. Reach us by email or through our official social channels.",
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
  openGraph: {
    title: "Contact HamroBichar | Get in Touch",
    description:
      "Reach the HamroBichar team for news tips, collaborations, corrections, and publishing inquiries.",
    url: "https://hamrobichar.com/contact",
    siteName: "HamroBichar",
    locale: "en_US",
    type: "website"
  },
  alternates: {
    canonical: "/contact"
  }
};

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61565276758903"
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/hamrobichar/"
  }
];

export default async function ContactPage() {
  const cookieStore = await cookies();
  const dictionary = getDictionary(normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value));

  return (
    <section className="mx-auto my-8 w-full max-w-3xl rounded-2xl bg-white p-5 shadow-sm sm:my-10 sm:p-8 lg:p-10">
      <h1 className="text-3xl font-black text-slate-900">{dictionary.contact.title}</h1>
      <p className="mt-4 text-base leading-7 text-slate-700">
        {dictionary.contact.description}
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Email</p>
        <a
          href="mailto:info@hamrobichar.com"
          className="mt-1 inline-block text-base font-semibold text-rose-700 hover:text-rose-800"
        >
          info@hamrobichar.com
        </a>
      </div>

      <div className="mt-6 space-y-3">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:border-rose-300 hover:bg-rose-50"
          >
            <span className="font-semibold text-slate-800">{social.name}</span>
            <span className="text-sm font-semibold text-rose-700">{dictionary.contact.visit}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
