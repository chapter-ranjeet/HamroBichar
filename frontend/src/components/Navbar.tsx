import Link from "next/link";

export default function Navbar() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="border-b border-slate-100 bg-slate-900 text-slate-100">
        <div className="flex w-full items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-10">
          <p className="font-semibold tracking-wide">{today}</p>
          <p className="flex items-center gap-2 font-semibold uppercase tracking-wider text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live Updates
          </p>
        </div>
      </div>

      <nav className="flex w-full flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div>
          <Link href="/" className="text-2xl font-black tracking-tight text-rose-700 sm:text-3xl">
            HamroBichar
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">
            Voices and News from Nepal
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
          <Link
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
            href="/"
          >
            Home
          </Link>
        </div>
      </nav>
    </header>
  );
}
