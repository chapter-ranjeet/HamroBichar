import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="w-full px-4 py-7 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 text-sm text-slate-600 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-semibold text-slate-700">
              © {new Date().getFullYear()} HamroBichar. Independent news for Nepal.
            </p>
            <p className="mt-1 text-xs text-slate-500">Voices and News from Nepal</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Quick Links</p>
            <div className="flex flex-wrap items-center gap-3">
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

          <div className="flex flex-col gap-2">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Follow HamroBichar</p>
            <div className="flex flex-wrap items-start gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61565276758903"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-24 flex-col items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
              >
                <Image
                  src="/hamrobicharlogo.jpeg"
                  alt="HamroBichar app icon"
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px] rounded-full object-cover"
                />
                <span className="text-xs">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/hamrobichar/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-24 flex-col items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
              >
                <Image
                  src="/hamrobicharlogo.jpeg"
                  alt="HamroBichar app icon"
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px] rounded-full object-cover"
                />
                <span className="text-xs">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
