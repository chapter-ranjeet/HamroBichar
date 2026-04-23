"use client";

import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { loginAdmin } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);
      const response = await loginAdmin(email, password);
      localStorage.setItem("hamrobichar_token", response.token);
      localStorage.setItem("hamrobichar_user", JSON.stringify(response.user));

      if (response.user.role === "subadmin") {
        router.push("/subadmin/dashboard");
        return;
      }

      if (pathname.startsWith("/subadmin")) {
        router.push("/master/dashboard");
        return;
      }

      router.push("/master/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto my-12 w-full max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-black text-slate-900">Admin Login</h1>
      <p className="mt-1 text-sm text-slate-600">Sign in to manage news content.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-rose-300 focus:ring"
            placeholder="admin@hamrobichar.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-rose-300 focus:ring"
            placeholder="Your password"
          />
        </div>

        {error && <p className="text-sm font-semibold text-rose-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  );
}
