"use client";

import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "@/components/LanguageProvider";

export default function Footer() {
  const year = new Date().getFullYear();
  const { dictionary } = useLanguage();

  return (
    <footer className="mt-8 border-t border-slate-200 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 sm:mt-10">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="rounded-4xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.25)] backdrop-blur md:p-6 lg:p-8">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr] xl:gap-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <span className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white shadow-lg shadow-rose-500/20">
                  <Image
                    src="/HBLogo2.png"
                    alt="HamroBichar logo"
                    width={64}
                    height={64}
                    className="h-12 w-12 object-contain"
                    priority
                  />
                </span>
                <div>
                  <p className="text-base font-extrabold tracking-tight text-white">HamroBichar</p>
                  <p className="text-xs font-medium text-rose-200/90">{dictionary.footer.voices}</p>
                </div>
              </div>

              <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-[15px]">
                {dictionary.home.description}
              </p>

              
            </div>

            <div className="grid gap-8 sm:grid-cols-2 xl:col-span-2 xl:grid-cols-2 xl:gap-10">
              <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{dictionary.footer.quickLinks}</p>
                <div className="grid gap-3 text-sm font-semibold text-slate-200">
                  <Link className="transition hover:text-white" href="/about">
                    {dictionary.footer.about}
                  </Link>
                  <Link className="transition hover:text-white" href="/contact">
                    {dictionary.footer.contact}
                  </Link>
                  <Link className="transition hover:text-white" href="/privacy-policy">
                    {dictionary.footer.privacy}
                  </Link>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{dictionary.footer.followUs}</p>
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-white sm:text-sm">{dictionary.nav.facebook}</p>
                      <p className="hidden truncate text-xs text-slate-400 sm:block">hamrobichar</p>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/9779800000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-emerald-400/50 hover:bg-emerald-500/10"
                    aria-label="HamroBichar WhatsApp"
                  >
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition group-hover:scale-105">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                        <path d="M12 2a9.96 9.96 0 0 0-8.6 15.04L2 22l5.12-1.35A10 10 0 1 0 12 2Zm0 18.2c-1.7 0-3.38-.45-4.84-1.3l-.35-.2-3.04.8.81-2.96-.23-.38A8.2 8.2 0 1 1 12 20.2Zm4.72-6.2c-.25-.12-1.48-.73-1.71-.82-.23-.08-.4-.12-.58.12-.17.25-.66.82-.81.99-.15.17-.3.19-.55.06-.25-.12-1.04-.39-1.98-1.24-.73-.65-1.22-1.46-1.36-1.71-.14-.25-.01-.39.11-.52.11-.12.25-.31.37-.47.12-.16.16-.27.25-.45.08-.17.04-.33-.02-.45-.06-.12-.58-1.39-.8-1.91-.21-.5-.43-.43-.58-.44h-.5c-.17 0-.45.06-.68.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.12.17 1.77 2.71 4.29 3.8.6.26 1.07.42 1.43.54.6.19 1.15.16 1.58.1.48-.07 1.48-.61 1.69-1.2.21-.58.21-1.07.15-1.2-.06-.12-.23-.19-.48-.31Z" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-white sm:text-sm">{dictionary.nav.whatsapp}</p>
                      <p className="hidden truncate text-xs text-slate-400 sm:block">Chat with us</p>
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-white sm:text-sm">{dictionary.nav.instagram}</p>
                      <p className="hidden truncate text-xs text-slate-400 sm:block">@hamrobichar</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} HamroBichar. {dictionary.footer.rights}</p>
            <p>{dictionary.footer.voices}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
