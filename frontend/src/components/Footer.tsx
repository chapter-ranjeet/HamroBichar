import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="rounded-4xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.25)] backdrop-blur md:p-6 lg:p-8">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr] xl:gap-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/10 shadow-lg shadow-rose-500/20">
                  <Image
                    src="/hamrobicharlogo.jpeg"
                    alt="HamroBichar logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-cover"
                    priority
                  />
                </span>
                <div>
                  <p className="text-base font-extrabold tracking-tight text-white">HamroBichar</p>
                  <p className="text-xs font-medium text-rose-200/90">Voices and News from Nepal</p>
                </div>
              </div>

              <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-[15px]">
                HamroBichar is a news platform dedicated to delivering authentic and engaging content
              </p>

              
            </div>

            <div className="grid gap-8 sm:grid-cols-2 xl:col-span-2 xl:grid-cols-2 xl:gap-10">
              <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Quick Links</p>
                <div className="grid gap-3 text-sm font-semibold text-slate-200">
                  <Link className="transition hover:text-white" href="/about">
                    About HamroBichar
                  </Link>
                  <Link className="transition hover:text-white" href="/contact">
                    Contact the Team
                  </Link>
                  <Link className="transition hover:text-white" href="/privacy-policy">
                    Privacy Policy
                  </Link>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Follow Us</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href="https://www.facebook.com/profile.php?id=61565276758903"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-blue-400/50 hover:bg-blue-500/10"
                    aria-label="HamroBichar Facebook"
                  >
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25 transition group-hover:scale-105">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                        <path d="M13.5 9H16V6h-2.5C10.9 6 9 7.9 9 10.5V13H7v3h2v6h3v-6h2.4l.6-3H12v-2.5c0-.8.7-1.5 1.5-1.5Z" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">Facebook</p>
                      <p className="truncate text-xs text-slate-400">hamrobichar</p>
                    </div>
                  </a>

                  <a
                    href="https://www.instagram.com/hamrobichar/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-pink-400/50 hover:bg-pink-500/10"
                    aria-label="HamroBichar Instagram"
                  >
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-fuchsia-500 via-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/25 transition group-hover:scale-105">
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                        <rect x="5" y="5" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">Instagram</p>
                      <p className="truncate text-xs text-slate-400">@hamrobichar</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} HamroBichar. All rights reserved.</p>
            <p>Voices and News from Nepal.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
