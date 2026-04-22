import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-linear-to-b from-white via-slate-50 to-slate-100">
      <div className="w-full px-4 py-10 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm sm:p-7">
          <div className="grid gap-8 text-sm text-slate-600 md:grid-cols-[1.35fr,1fr,1fr]">
            <div className="space-y-3">
              <p className="text-xl font-black tracking-tight text-slate-800">HamroBichar</p>
              <p className="max-w-md text-sm leading-6 text-slate-600">
                Independent reporting, meaningful analysis, and timely updates from Nepal.
              </p>
              <div className="h-px w-full max-w-sm bg-slate-200" />
              <p className="pt-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                © {new Date().getFullYear()} HamroBichar. All rights reserved.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Quick Links</p>
              <div className="flex flex-col items-start gap-2">
                <Link href="/about" className="font-semibold text-slate-700 transition hover:text-rose-700">
                  About
                </Link>
                <Link href="/contact" className="font-semibold text-slate-700 transition hover:text-rose-700">
                  Contact
                </Link>
                <Link href="/privacy-policy" className="font-semibold text-slate-700 transition hover:text-rose-700">
                  Privacy Policy
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Social Media</p>
              <div className="flex flex-wrap items-start gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61565276758903"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-28 flex-col items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-center transition hover:border-blue-300 hover:bg-blue-50"
                  aria-label="HamroBichar Facebook"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path d="M13.5 9H16V6h-2.5C10.9 6 9 7.9 9 10.5V13H7v3h2v6h3v-6h2.4l.6-3H12v-2.5c0-.8.7-1.5 1.5-1.5Z" />
                    </svg>
                  </span>
                  <span className="mt-1 text-xs font-bold text-slate-700">Facebook</span>
                  <span className="text-[11px] text-slate-500">hamrobichar</span>
                </a>

                <a
                  href="https://www.instagram.com/hamrobichar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-28 flex-col items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-center transition hover:border-pink-300 hover:bg-pink-50"
                  aria-label="HamroBichar Instagram"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 via-pink-500 to-orange-400 text-white">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                      <rect x="5" y="5" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="mt-1 text-xs font-bold text-slate-700">Instagram</span>
                  <span className="text-[11px] text-slate-500">@hamrobichar</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
