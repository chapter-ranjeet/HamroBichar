import { Suspense } from "react";

import HomePageClient from "@/components/HomePageClient";

export default function HomePage() {
  return (
    <Suspense fallback={<p className="py-8 text-slate-600">Loading latest news...</p>}>
      <HomePageClient />
    </Suspense>
  );
}
