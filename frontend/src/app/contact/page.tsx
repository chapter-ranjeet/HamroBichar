import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact HamroBichar and follow our official social media profiles.",
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

export default function ContactPage() {
  return (
    <section className="mx-auto my-8 w-full max-w-3xl rounded-2xl bg-white p-5 shadow-sm sm:my-10 sm:p-8 lg:p-10">
      <h1 className="text-3xl font-black text-slate-900">Contact Us</h1>
      <p className="mt-4 text-base leading-7 text-slate-700">
        For collaborations, corrections, or publishing inquiries, connect with us through our
        official social media pages.
      </p>

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
            <span className="text-sm font-semibold text-rose-700">Visit profile</span>
          </a>
        ))}
      </div>
    </section>
  );
}
