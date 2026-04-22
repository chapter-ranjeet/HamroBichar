"use client";

import { useEffect } from "react";

import { trackArticleView } from "@/lib/api";

interface ArticleViewTrackerProps {
  slug: string;
}

export default function ArticleViewTracker({ slug }: ArticleViewTrackerProps) {
  useEffect(() => {
    void trackArticleView(slug);
  }, [slug]);

  return null;
}
