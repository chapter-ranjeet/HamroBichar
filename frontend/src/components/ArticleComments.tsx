"use client";

import { FormEvent, useEffect, useState } from "react";

import { createArticleComment, getArticleComments } from "@/lib/api";
import { Comment } from "@/types";

interface ArticleCommentsProps {
  slug: string;
}

export default function ArticleComments({ slug }: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const result = await getArticleComments(slug);
        setComments(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    void loadComments();
  }, [slug]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setPosting(true);
      setError(null);
      const created = await createArticleComment(slug, {
        name: name.trim(),
        message: message.trim()
      });

      setComments((prev) => [created, ...prev]);
      setName("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Comments</p>
          <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">Join the discussion</h2>
        </div>
        <p className="text-sm font-semibold text-slate-500">{comments.length} comments</p>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-300"
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write your comment..."
          required
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-300"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Keep comments respectful and on topic.</p>
          <button
            type="submit"
            disabled={posting}
            className="rounded-full bg-rose-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {posting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

      <div className="mt-5 space-y-3">
        {loading && <p className="text-sm text-slate-600">Loading comments...</p>}

        {!loading && comments.length === 0 && <p className="text-sm text-slate-600">No comments yet. Be the first to share your view.</p>}

        {comments.map((comment) => (
          <div key={comment._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="max-w-full break-words font-bold text-slate-900">{comment.name}</p>
              <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
            </div>
            <p className="mt-2 break-words text-sm leading-7 text-slate-700">{comment.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
