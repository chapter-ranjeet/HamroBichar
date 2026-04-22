import { Suspense } from "react";
import type { Metadata } from "next";

import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "Latest Nepal News",
  description: "Read the latest Nepal headlines across politics, education, business, and technology on HamroBichar.",
  alternates: {
    canonical: "/"
  }
};

export default function HomePage() {
  return (
    <Suspense fallback={<p className="py-8 text-slate-600">Loading latest news...</p>}>
      <HomePageClient />
    </Suspense>
  );
}
