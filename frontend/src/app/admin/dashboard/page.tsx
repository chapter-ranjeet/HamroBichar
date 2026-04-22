"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  changeAdminPassword,
  createArticle,
  deleteArticle,
  getAdminUsers,
  getArticles,
  updateAdminUserRole,
  updateArticle,
  uploadArticleImage
} from "@/lib/api";
import { AdminUser, Article } from "@/types";

interface FormState {
  title: string;
  author: string;
  content: string;
  category: string;
  image: string;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const emptyForm: FormState = {
  title: "",
  author: "",
  content: "",
  category: "",
  image: ""
};

const emptyPasswordForm: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const tokenRef = useRef<string>("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(emptyPasswordForm);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);
  const availableCategories = useMemo(
    () => Array.from(new Set(articles.map((article) => article.category).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [articles]
  );
  const estimatedSlug = useMemo(() => slugify(form.title), [form.title]);
  const canSubmit = Boolean(form.title.trim() && form.content.trim() && form.category.trim()) && !uploadingImage;

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getArticles();
      setArticles(response.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const result = await getAdminUsers(tokenRef.current);
      setUsers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("hamrobichar_token");
    if (!savedToken) {
      router.replace("/master");
      return;
    }

    tokenRef.current = savedToken;
    queueMicrotask(() => {
      void loadArticles();
      void loadUsers();
    });
  }, [router]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      if (isEditing && editingId) {
        await updateArticle(editingId, form, tokenRef.current);
      } else {
        await createArticle(form, tokenRef.current);
      }

      resetForm();
      await loadArticles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit article");
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (article: Article) => {
    setEditingId(article._id);
    setForm({
      title: article.title,
      author: article.author,
      content: article.content,
      category: article.category,
      image: article.image ?? ""
    });
  };

  const onDelete = async (id: string) => {
    try {
      setError(null);
      await deleteArticle(id, tokenRef.current);
      await loadArticles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete article");
    }
  };

  const onImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);
      const imageUrl = await uploadArticleImage(file, tokenRef.current);
      setForm((prev) => ({ ...prev, image: imageUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const onRoleChange = async (userId: string, role: "admin" | "user") => {
    try {
      setError(null);
      await updateAdminUserRole(userId, role, tokenRef.current);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user role");
    }
  };

  const onChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAccountMessage("New password and confirm password do not match");
      return;
    }

    try {
      setChangingPassword(true);
      setAccountMessage(null);

      await changeAdminPassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        tokenRef.current
      );

      setPasswordForm(emptyPasswordForm);
      localStorage.removeItem("hamrobichar_token");
      localStorage.removeItem("hamrobichar_user");
      setAccountMessage("Password changed. Please sign in again.");
      router.replace("/master");
    } catch (err) {
      setAccountMessage(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const onLogout = () => {
    localStorage.removeItem("hamrobichar_token");
    localStorage.removeItem("hamrobichar_user");
    router.push("/master");
  };

  return (
    <section className="mx-auto my-6 grid w-full max-w-6xl gap-6 px-4 lg:my-8 lg:grid-cols-[1fr,1.1fr] sm:px-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-black text-slate-900">{isEditing ? "Edit Article" : "Create Article"}</h1>
          <button onClick={onLogout} className="text-sm font-semibold text-rose-700">
            Logout
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            required
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder="Article title"
          />
          <p className="text-xs font-medium text-slate-500">
            Slug preview: <span className="font-semibold text-slate-700">{estimatedSlug || "article-title"}</span>
          </p>
          <input
            value={form.author}
            onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder="Writer name (optional)"
          />
          <div className="rounded-lg border border-slate-300 p-2">
            <div className="mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, content: `${prev.content}<p><strong>Bold headline:</strong> </p>` }))}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                Add Bold Block
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    content: `${prev.content}<blockquote><em>Quote or key statement...</em></blockquote>`
                  }))
                }
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                Add Quote
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    content: `${prev.content}<ul><li>Point one</li><li>Point two</li></ul>`
                  }))
                }
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                Add Bullet List
              </button>
            </div>
            <textarea
              required
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              className="min-h-52 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
              placeholder="Write article body. You can paste HTML or plain text."
            />
            <p className="mt-1 text-xs text-slate-500">Tip: Plain text is automatically rendered with line breaks on article page.</p>
          </div>
          <input
            list="category-suggestions"
            required
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder="Category"
          />
          <datalist id="category-suggestions">
            {availableCategories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          <input
            value={form.image}
            onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder="Image URL (optional)"
          />
          <div className="space-y-1">
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {uploadingImage && <p className="text-xs text-slate-500">Uploading image...</p>}
          </div>

          {error && <p className="text-sm font-semibold text-rose-700">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : isEditing ? "Update Article" : "Create Article"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-slate-900">Existing Articles</h2>

        {loading ? (
          <p className="mt-4 text-slate-600">Loading articles...</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {articles.length === 0 && <li className="text-slate-500">No articles found.</li>}
            {articles.map((article) => (
              <li key={article._id} className="rounded-xl border border-slate-200 p-3">
                <p className="font-bold text-slate-800">{article.title}</p>
                <p className="text-xs text-slate-500">{article.category}</p>
                <div className="mt-2 flex gap-3 text-sm font-semibold">
                  <button onClick={() => onEdit(article)} className="text-amber-700">
                    Edit
                  </button>
                  <button onClick={() => void onDelete(article._id)} className="text-rose-700">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2 sm:p-6">
        <h2 className="text-xl font-black text-slate-900">User Management</h2>
        {usersLoading ? (
          <p className="mt-4 text-slate-600">Loading users...</p>
        ) : (
          <>
            <ul className="mt-4 space-y-3 md:hidden">
              {users.map((user) => (
                <li key={user._id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-semibold text-slate-800">{user.username}</p>
                  <p className="text-sm text-slate-600">{user.email}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                    {user.role}
                  </p>
                  <button
                    onClick={() => onRoleChange(user._id, user.role === "admin" ? "user" : "admin")}
                    className="mt-2 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                  >
                    Make {user.role === "admin" ? "User" : "Admin"}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Username</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-semibold text-slate-800">{user.username}</td>
                    <td className="py-2 pr-3 text-slate-600">{user.email}</td>
                    <td className="py-2 pr-3 uppercase text-xs font-bold text-slate-500">{user.role}</td>
                    <td className="py-2">
                      <button
                        onClick={() => onRoleChange(user._id, user.role === "admin" ? "user" : "admin")}
                        className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                      >
                        Make {user.role === "admin" ? "User" : "Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2 sm:p-6">
        <h2 className="text-xl font-black text-slate-900">Account Settings</h2>
        <p className="mt-1 text-sm text-slate-600">Use these actions to secure or end your admin session.</p>

        <div className="mt-4">
          <button
            onClick={onLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>

        <form onSubmit={onChangePassword} className="mt-6 grid gap-3 sm:grid-cols-2">
          <input
            type="password"
            required
            value={passwordForm.currentPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder="Current password"
          />
          <input
            type="password"
            required
            value={passwordForm.newPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder="New password"
          />
          <input
            type="password"
            required
            value={passwordForm.confirmPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring sm:col-span-2"
            placeholder="Confirm new password"
          />

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changingPassword ? "Changing password..." : "Change Password"}
            </button>
          </div>
        </form>

        {accountMessage && <p className="mt-3 text-sm font-semibold text-slate-700">{accountMessage}</p>}
      </div>
    </section>
  );
}
