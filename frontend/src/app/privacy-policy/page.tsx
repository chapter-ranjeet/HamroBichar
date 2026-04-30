import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/runtime";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read HamroBichar's privacy policy about data collection, usage, and user rights.",
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "Privacy Policy",
    description: "Read HamroBichar's privacy policy about data collection, usage, and user rights.",
    url: `${siteUrl}/privacy-policy`,
    siteName: "HamroBichar",
    locale: "en_US",
    type: "website"
  },
  alternates: {
    canonical: "/privacy-policy"
  }
};

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto my-8 w-full max-w-4xl rounded-2xl bg-white p-5 shadow-sm sm:my-10 sm:p-8 lg:p-10">
      <h1 className="text-3xl font-black text-slate-900">Privacy Policy</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated: April 22, 2026</p>

      <div className="prose prose-slate mt-6 max-w-none">
        <h2>Information We Collect</h2>
        <p>
          We may collect basic technical data such as browser type, pages visited, and interaction
          information to improve website performance and user experience.
        </p>

        <h2>How We Use Information</h2>
        <p>
          Collected information is used to maintain site security, improve content quality, and
          optimize platform performance.
        </p>

        <h2>Cookies</h2>
        <p>
          This website may use cookies or similar technologies for analytics and functional
          purposes. You can control cookie behavior through your browser settings.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          We may use third-party services such as hosting, analytics, and media providers. These
          services operate under their own privacy policies.
        </p>

        <h2>Data Security</h2>
        <p>
          We apply reasonable technical and organizational safeguards to protect information from
          unauthorized access or misuse.
        </p>

        <h2>Your Rights</h2>
        <p>
          You may request updates or removal of personal information where applicable. Please use
          our official social channels on the Contact page for privacy-related requests.
        </p>

        <h2>Policy Updates</h2>
        <p>
          This policy can be updated as needed. Material changes will be reflected on this page
          with a revised date.
        </p>
      </div>
    </section>
  );
}
