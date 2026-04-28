export default function ArticleSkeleton() {
  return (
    <article className="mx-auto my-4 w-full max-w-6xl">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="h-6 w-40 rounded bg-slate-200 animate-pulse" />
        <div className="mt-4 h-9 w-full max-w-3xl rounded bg-slate-200 animate-pulse" />
        <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
          <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
        </div>

        <div className="relative my-6 aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
          <div className="h-full w-full bg-slate-200 animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="h-4 w-56 rounded bg-slate-200 animate-pulse" />
            <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-3">
              <div className="h-20 w-full rounded bg-slate-200 animate-pulse" />
              <div className="h-20 w-full rounded bg-slate-200 animate-pulse" />
              <div className="h-20 w-full rounded bg-slate-200 animate-pulse" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
            <div className="mt-4 space-y-3">
              <div className="h-12 w-full rounded bg-slate-200 animate-pulse" />
              <div className="h-12 w-full rounded bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
