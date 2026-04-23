"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  changeAdminPassword,
  createSubAdmin,
  deleteSubAdmin,
  createArticle,
  deleteArticle,
  getAdminUsers,
  getArticles,
  resetSubAdminPassword,
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

interface SubAdminFormState {
  username: string;
  email: string;
  password: string;
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

const emptySubAdminForm: SubAdminFormState = {
  username: "",
  email: "",
  password: ""
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  const tokenRef = useRef<string>("");
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
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
  const [subAdminForm, setSubAdminForm] = useState<SubAdminFormState>(emptySubAdminForm);
  const [creatingSubAdmin, setCreatingSubAdmin] = useState(false);
  const [subAdminMessage, setSubAdminMessage] = useState<string | null>(null);
  const [managingSubAdmin, setManagingSubAdmin] = useState<string | null>(null);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);
  const currentUser = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const saved = localStorage.getItem("hamrobichar_user");
    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved) as { id: string; role: "superadmin" | "admin" | "subadmin" | "user" };
    } catch {
      return null;
    }
  }, []);
  const isSuperAdmin = currentUser?.role === "admin" || currentUser?.role === "superadmin";
  const isSubAdmin = currentUser?.role === "subadmin";
  const availableCategories = useMemo(
    () => Array.from(new Set(articles.map((article) => article.category).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [articles]
  );
  const estimatedSlug = useMemo(() => slugify(form.title), [form.title]);
  const canSubmit = Boolean(form.title.trim() && form.content.trim() && form.category.trim()) && !uploadingImage;
  const canModifyArticle = (article: Article): boolean => {
    if (isSuperAdmin) {
      return true;
    }

    if (isSubAdmin && currentUser?.id) {
      return article.createdBy === currentUser.id;
    }

    return false;
  };

  const insertAtCursor = (value: string) => {
    const editor = editorRef.current;
    if (!editor) {
      setForm((prev) => ({ ...prev, content: `${prev.content}${value}` }));
      return;
    }

    const start = editor.selectionStart ?? form.content.length;
    const end = editor.selectionEnd ?? form.content.length;
    const before = form.content.slice(0, start);
    const selected = form.content.slice(start, end);
    const after = form.content.slice(end);
    const nextValue = `${before}${value.replace("{{text}}", selected || "")}${after}`;

    setForm((prev) => ({ ...prev, content: nextValue }));

    requestAnimationFrame(() => {
      editor.focus();
      const cursor = start + value.length;
      editor.setSelectionRange(cursor, cursor);
    });
  };

  const wrapSelection = (openTag: string, closeTag: string) => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const start = editor.selectionStart ?? 0;
    const end = editor.selectionEnd ?? 0;
    const before = form.content.slice(0, start);
    const selected = form.content.slice(start, end) || "text";
    const after = form.content.slice(end);
    const nextValue = `${before}${openTag}${selected}${closeTag}${after}`;

    setForm((prev) => ({ ...prev, content: nextValue }));

    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
    });
  };

  const addLink = () => {
    const url = window.prompt("Enter URL", "https://");
    if (!url) {
      return;
    }

    wrapSelection(`<a href=\"${url}\" target=\"_blank\" rel=\"noopener noreferrer\">`, "</a>");
  };

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
    const savedUser = localStorage.getItem("hamrobichar_user");
    if (!savedToken) {
      router.replace(pathname.startsWith("/subadmin") ? "/subadmin" : "/master");
      return;
    }

    if (!savedUser) {
      router.replace(pathname.startsWith("/subadmin") ? "/subadmin" : "/master");
      return;
    }

    let parsed: { role: "superadmin" | "admin" | "subadmin" | "user" };

    try {
      parsed = JSON.parse(savedUser) as { role: "superadmin" | "admin" | "subadmin" | "user" };
    } catch {
      localStorage.removeItem("hamrobichar_token");
      localStorage.removeItem("hamrobichar_user");
      router.replace(pathname.startsWith("/subadmin") ? "/subadmin" : "/master");
      return;
    }

    const isSuper = parsed.role === "admin" || parsed.role === "superadmin";

    if (pathname.startsWith("/subadmin") && parsed.role !== "subadmin") {
      router.replace("/master/dashboard");
      return;
    }

    if (pathname.startsWith("/master") && !isSuper) {
      router.replace("/subadmin/dashboard");
      return;
    }

    tokenRef.current = savedToken;
    queueMicrotask(() => {
      void loadArticles();
      if (isSuper) {
        void loadUsers();
      }
    });
  }, [pathname, router]);

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

  const onRoleChange = async (userId: string, role: "superadmin" | "admin" | "subadmin" | "user") => {
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

  const onCreateSubAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setCreatingSubAdmin(true);
      setSubAdminMessage(null);

      await createSubAdmin(
        {
          username: subAdminForm.username,
          email: subAdminForm.email,
          password: subAdminForm.password
        },
        tokenRef.current
      );

      setSubAdminForm(emptySubAdminForm);
      setSubAdminMessage("Subadmin created successfully.");
      await loadUsers();
    } catch (err) {
      setSubAdminMessage(err instanceof Error ? err.message : "Failed to create subadmin");
    } finally {
      setCreatingSubAdmin(false);
    }
  };

  const onResetSubAdminPassword = async (userId: string) => {
    const nextPassword = window.prompt("Enter new password for subadmin (min 6 chars)");
    if (!nextPassword) {
      return;
    }

    try {
      setManagingSubAdmin(userId);
      setSubAdminMessage(null);
      await resetSubAdminPassword(userId, nextPassword, tokenRef.current);
      setSubAdminMessage("Subadmin password updated successfully.");
    } catch (err) {
      setSubAdminMessage(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setManagingSubAdmin(null);
    }
  };

  const onDeleteSubAdmin = async (userId: string) => {
    const confirmed = window.confirm("Delete this subadmin account?");
    if (!confirmed) {
      return;
    }

    try {
      setManagingSubAdmin(userId);
      setSubAdminMessage(null);
      await deleteSubAdmin(userId, tokenRef.current);
      setSubAdminMessage("Subadmin deleted successfully.");
      await loadUsers();
    } catch (err) {
      setSubAdminMessage(err instanceof Error ? err.message : "Failed to delete subadmin");
    } finally {
      setManagingSubAdmin(null);
    }
  };

  const onLogout = () => {
    localStorage.removeItem("hamrobichar_token");
    localStorage.removeItem("hamrobichar_user");
    router.push(pathname.startsWith("/subadmin") ? "/subadmin" : "/master");
  };

  return (
    <section className="mx-auto my-6 w-full max-w-6xl space-y-6 px-4 lg:my-8 sm:px-6">
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
                onClick={() => wrapSelection("<strong>", "</strong>")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => wrapSelection("<em>", "</em>")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                Italic
              </button>
              <button
                type="button"
                onClick={() => wrapSelection("<u>", "</u>")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                Underline
              </button>
              <button
                type="button"
                onClick={() => wrapSelection("<h2>", "</h2>")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => wrapSelection("<h3>", "</h3>")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => insertAtCursor("<blockquote>{{text}}</blockquote>")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                Quote
              </button>
              <button
                type="button"
                onClick={() => insertAtCursor("<ul>\n  <li>{{text}}</li>\n  <li></li>\n</ul>")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                Bullet List
              </button>
              <button
                type="button"
                onClick={() => insertAtCursor("<ol>\n  <li>{{text}}</li>\n  <li></li>\n</ol>")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                Numbered List
              </button>
              <button
                type="button"
                onClick={addLink}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                Link
              </button>
              <button
                type="button"
                onClick={() => insertAtCursor("<img src=\"\" alt=\"{{text}}\" />")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                Image Tag
              </button>
            </div>
            <textarea
              required
              ref={editorRef}
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              className="min-h-52 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
              placeholder="Write article body. You can paste HTML or plain text."
            />
            <p className="mt-1 text-xs text-slate-500">Word-like editing tools are available above. Plain text is also supported.</p>

            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-slate-500">Live Preview</p>
              <div className="prose prose-slate max-w-none rounded bg-white p-3 text-sm" dangerouslySetInnerHTML={{ __html: form.content || "<p>Preview will appear here...</p>" }} />
            </div>
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
                <p className="text-xs text-slate-500">Author: {article.author}</p>
                <div className="mt-2 flex gap-3 text-sm font-semibold">
                  <button onClick={() => onEdit(article)} disabled={!canModifyArticle(article)} className="text-amber-700 disabled:cursor-not-allowed disabled:opacity-40">
                    Edit
                  </button>
                  <button
                    onClick={() => void onDelete(article._id)}
                    disabled={!isSuperAdmin}
                    className="text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
                {!isSuperAdmin && !canModifyArticle(article) && (
                  <p className="mt-1 text-xs font-semibold text-slate-500">Subadmin can edit only own articles.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isSuperAdmin && (
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-black text-slate-900">Create Subadmin</h2>
          <p className="mt-1 text-sm text-slate-600">Subadmins can post articles and edit only their own posts.</p>

          <form onSubmit={onCreateSubAdmin} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              required
              value={subAdminForm.username}
              onChange={(event) => setSubAdminForm((prev) => ({ ...prev, username: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
              placeholder="Username"
            />
            <input
              type="email"
              required
              value={subAdminForm.email}
              onChange={(event) => setSubAdminForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
              placeholder="Email"
            />
            <input
              type="password"
              required
              minLength={6}
              value={subAdminForm.password}
              onChange={(event) => setSubAdminForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
              placeholder="Password"
            />
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={creatingSubAdmin}
                className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingSubAdmin ? "Creating..." : "Create Subadmin"}
              </button>
            </div>
          </form>

          {subAdminMessage && <p className="mt-3 text-sm font-semibold text-slate-700">{subAdminMessage}</p>}
        </div>
      )}

      {isSuperAdmin && (
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
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
                    onClick={() => onRoleChange(user._id, user.role === "subadmin" ? "user" : "subadmin")}
                    className="mt-2 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                  >
                    Make {user.role === "subadmin" ? "User" : "Subadmin"}
                  </button>
                  {user.role === "subadmin" && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => onResetSubAdminPassword(user._id)}
                        disabled={managingSubAdmin === user._id}
                        className="rounded border border-blue-300 px-2 py-1 text-xs font-semibold text-blue-700 disabled:opacity-50"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => onDeleteSubAdmin(user._id)}
                        disabled={managingSubAdmin === user._id}
                        className="rounded border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 disabled:opacity-50"
                      >
                        Delete Subadmin
                      </button>
                    </div>
                  )}
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onRoleChange(user._id, user.role === "subadmin" ? "user" : "subadmin")}
                          className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                        >
                          Make {user.role === "subadmin" ? "User" : "Subadmin"}
                        </button>
                        {user.role === "subadmin" && (
                          <>
                            <button
                              onClick={() => onResetSubAdminPassword(user._id)}
                              disabled={managingSubAdmin === user._id}
                              className="rounded border border-blue-300 px-2 py-1 text-xs font-semibold text-blue-700 disabled:opacity-50"
                            >
                              Reset Password
                            </button>
                            <button
                              onClick={() => onDeleteSubAdmin(user._id)}
                              disabled={managingSubAdmin === user._id}
                              className="rounded border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 disabled:opacity-50"
                            >
                              Delete Subadmin
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-slate-900">Account Settings</h2>
        <p className="mt-1 text-sm text-slate-600">Use these actions to secure or end your admin session.</p>

        {!isSubAdmin ? (
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
        ) : (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Subadmin passwords are managed by superadmin only.
          </p>
        )}

        {accountMessage && <p className="mt-3 text-sm font-semibold text-slate-700">{accountMessage}</p>}
      </div>
    </section>
  );
}
