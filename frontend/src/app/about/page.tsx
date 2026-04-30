import type { Metadata } from "next";
import { cookies } from "next/headers";

import { getDictionary, LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/runtime";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "About HamroBichar | Nepal News Mission",
  description: "Learn about HamroBichar, our mission, and our commitment to independent journalism in Nepal.",
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "About HamroBichar | Nepal News Mission",
    description: "Learn about HamroBichar, our mission, and our commitment to independent journalism in Nepal.",
    url: `${siteUrl}/about`,
    siteName: "HamroBichar",
    locale: "en_US",
    type: "website"
  },
  alternates: {
    canonical: "/about"
  }
};

export default async function AboutPage() {
  const cookieStore = await cookies();
  const dictionary = getDictionary(normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value));

  return (
    <section className="mx-auto my-8 w-full max-w-4xl rounded-2xl bg-white p-5 shadow-sm sm:my-10 sm:p-8 lg:p-10">
      <h1 className="text-3xl font-black text-slate-900">{dictionary.about.title}</h1>
      <p className="mt-4 text-base leading-7 text-slate-700">
        {dictionary.about.p1}
      </p>
      <p className="mt-4 text-base leading-7 text-slate-700">
        {dictionary.about.p2}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-lg font-bold text-slate-900">{dictionary.about.missionTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {dictionary.about.missionText}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-lg font-bold text-slate-900">{dictionary.about.promiseTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {dictionary.about.promiseText}
          </p>
        </div>
      </div>
    </section>
  );
}
