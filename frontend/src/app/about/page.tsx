import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about HamroBichar, our mission, and our commitment to independent journalism in Nepal.",
  alternates: {
    canonical: "/about"
  }
};

export default function AboutPage() {
  return (
    <section className="mx-auto my-8 w-full max-w-4xl rounded-2xl bg-white p-5 shadow-sm sm:my-10 sm:p-8 lg:p-10">
      <h1 className="text-3xl font-black text-slate-900">About HamroBichar</h1>
      <p className="mt-4 text-base leading-7 text-slate-700">
        HamroBichar is a Nepal-focused digital news platform dedicated to delivering timely,
        accurate, and easy-to-read reporting.
      </p>
      <p className="mt-4 text-base leading-7 text-slate-700">
        We cover politics, education, business, technology, and social issues that shape daily
        life. Our goal is to make important information accessible and useful for everyone.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-lg font-bold text-slate-900">Our Mission</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Publish reliable reporting and meaningful views that help readers understand Nepal
            better.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-lg font-bold text-slate-900">Our Promise</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Keep improving quality, speed, and transparency while respecting readers and sources.
          </p>
        </div>
      </div>
    </section>
  );
}
