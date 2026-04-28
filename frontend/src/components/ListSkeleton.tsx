export default function ListSkeleton({ cols = 3 }: { cols?: number }) {
  const items = new Array(6).fill(0);
  return (
    <section className="mx-auto my-8 w-full max-w-7xl">
      <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-${cols}`}>
        {items.map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="h-44 w-full rounded-3xl bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </section>
  );
}
