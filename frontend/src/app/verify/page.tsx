import type { Metadata } from "next";

import { verifyCertificate } from "@/lib/api";
import { getSiteUrl } from "@/lib/runtime";

export const dynamic = "force-dynamic";

const siteUrl = getSiteUrl();

type VerifyPageProps = {
  searchParams: Promise<{ certificateId?: string }>;
};

export const metadata: Metadata = {
  title: "Certificate Verification | HamroBichar",
  description: "Verify a HamroBichar certificate ID and view the associated identity details.",
  robots: {
    index: false,
    follow: true
  },
  alternates: {
    canonical: `${siteUrl}/verify`
  },
  openGraph: {
    title: "Certificate Verification | HamroBichar",
    description: "Verify a HamroBichar certificate ID and view the associated identity details.",
    url: `${siteUrl}/verify`,
    siteName: "HamroBichar",
    locale: "en_US",
    type: "website",
    images: [{ url: `${siteUrl}/HBLogo2.png`, alt: "HamroBichar" }]
  }
};

const formatDate = (value?: string): string => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString();
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { certificateId = "" } = await searchParams;
  const trimmedId = certificateId.trim();

  let certificate:
    | Awaited<ReturnType<typeof verifyCertificate>>
    | null = null;
  let error: string | null = null;

  if (trimmedId) {
    try {
      certificate = await verifyCertificate(trimmedId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Certificate not found";
    }
  }

  return (
    <section className="mx-auto my-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-linear-to-r from-slate-900 via-rose-800 to-rose-700 px-6 py-8 text-white sm:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-100">Public Verification</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Verify Certificate ID</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-rose-50">
          Enter a certificate ID to confirm the registered person’s name, age, designation, and dates.
        </p>
      </div>

      <div className="p-6 sm:p-8">
        <form action="/verify" method="get" className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row">
          <input
            name="certificateId"
            defaultValue={trimmedId}
            placeholder="Enter certificate ID"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-rose-300 focus:ring"
          />
          <button className="rounded-xl bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-800">
            Verify
          </button>
        </form>

        {!trimmedId && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Type a certificate ID to verify it.
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {certificate && (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Verified</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{certificate.name}</h2>
              </div>
              <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white">
                {certificate.certificateId}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Age</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{certificate.age}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Designation / Role</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{certificate.role || certificate.designation}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Issue Date</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{formatDate(certificate.issueDate)}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Expiry Date</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{formatDate(certificate.expiryDate)}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-white p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Verification details</p>
              <p className="mt-1">Name: {certificate.name}</p>
              <p>Designation: {certificate.designation}</p>
              <p>Issued on: {formatDate(certificate.issueDate)}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}