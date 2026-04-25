"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { useLanguage } from "@/components/LanguageProvider";
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
  titleNp: string;
  author: string;
  content: string;
  contentNp: string;
  category: string;
  categoryNp: string;
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
  titleNp: "",
  author: "",
  content: "",
  contentNp: "",
  category: "",
  categoryNp: "",
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
  const { dictionary } = useLanguage();

  const tokenRef = useRef<string>("");
  const editorRef = useRef<HTMLDivElement | null>(null);
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
  const [articleSearchTerm, setArticleSearchTerm] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [showUserManagementPanel, setShowUserManagementPanel] = useState(false);
  const [showAccountSettingsPanel, setShowAccountSettingsPanel] = useState(false);

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
  const isMasterRoute = pathname.startsWith("/master");
  const filteredArticles = useMemo(() => {
    const query = articleSearchTerm.trim().toLowerCase();
    if (!query) {
      return articles;
    }

    return articles.filter((article) => {
      return (
        article.title.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query)
      );
    });
  }, [articleSearchTerm, articles]);
  const groupedFilteredArticles = useMemo(() => {
    const groups = filteredArticles.reduce<Record<string, Article[]>>((acc, article) => {
      if (!acc[article.category]) {
        acc[article.category] = [];
      }

      acc[article.category].push(article);
      return acc;
    }, {});

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredArticles]);
  const canModifyArticle = (article: Article): boolean => {
    if (isSuperAdmin) {
      return true;
    }

    if (isSubAdmin && currentUser?.id) {
      return article.createdBy === currentUser.id;
    }

    return false;
  };

  const syncEditorContent = () => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    setForm((prev) => ({ ...prev, content: editor.innerHTML }));
  };

  const execEditorCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditorContent();
  };

  const changeFontSize = (direction: "increase" | "decrease") => {
    const currentSize = Number(window.prompt(dictionary.admin.fontSizePrompt, "16"));
    if (!currentSize || Number.isNaN(currentSize)) {
      return;
    }

    const nextSize = direction === "increase" ? currentSize + 2 : Math.max(10, currentSize - 2);
    execEditorCommand("fontSize", "7");

    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const fonts = editor.querySelectorAll("font[size='7']");
    fonts.forEach((font) => {
      (font as HTMLElement).removeAttribute("size");
      (font as HTMLElement).style.fontSize = `${nextSize}px`;
    });

    syncEditorContent();
  };

  const insertAtCursor = (value: string) => {
    const editor = editorRef.current;
    if (!editor) {
      setForm((prev) => ({ ...prev, content: `${prev.content}${value}` }));
      return;
    }

    editor.focus();
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";
    const html = value.replace("{{text}}", selectedText || "text");
    document.execCommand("insertHTML", false, html);
    syncEditorContent();
  };

  const wrapSelection = (openTag: string, closeTag: string) => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.focus();
    const selectedText = window.getSelection()?.toString() || "text";
    document.execCommand("insertHTML", false, `${openTag}${selectedText}${closeTag}`);
    syncEditorContent();
  };

  const addLink = () => {
    const url = window.prompt(dictionary.admin.promptEnterUrl, "https://");
    if (!url) {
      return;
    }

    const selectedText = window.getSelection()?.toString() || dictionary.admin.linkDefaultText;
    execEditorCommand("insertHTML", `<a href=\"${url}\" target=\"_blank\" rel=\"noopener noreferrer\">${selectedText}</a>`);
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getArticles();
      setArticles(response.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : dictionary.admin.failedLoadArticles);
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
      setError(err instanceof Error ? err.message : dictionary.admin.failedLoadUsers);
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
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
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
      setError(err instanceof Error ? err.message : dictionary.admin.submitFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (article: Article) => {
    setEditingId(article._id);
    setForm({
      title: article.title,
      titleNp: article.titleNp ?? "",
      author: article.author,
      content: article.content,
      contentNp: article.contentNp ?? "",
      category: article.category,
      categoryNp: article.categoryNp ?? "",
      image: article.image ?? ""
    });

    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = article.content;
      }
    });
  };

  const onDelete = async (id: string) => {
    try {
      setError(null);
      await deleteArticle(id, tokenRef.current);
      await loadArticles();
    } catch (err) {
      setError(err instanceof Error ? err.message : dictionary.admin.failedDeleteArticle);
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
      setError(err instanceof Error ? err.message : dictionary.admin.failedUploadImage);
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
      setError(err instanceof Error ? err.message : dictionary.admin.failedUpdateRole);
    }
  };

  const onChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAccountMessage(dictionary.admin.passwordMismatch);
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
      setAccountMessage(dictionary.admin.passwordChangedReLogin);
      router.replace("/master");
    } catch (err) {
      setAccountMessage(err instanceof Error ? err.message : dictionary.admin.failedChangePassword);
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
      setSubAdminMessage(dictionary.admin.subadminCreatedSuccess);
      await loadUsers();
    } catch (err) {
      setSubAdminMessage(err instanceof Error ? err.message : dictionary.admin.failedCreateSubadmin);
    } finally {
      setCreatingSubAdmin(false);
    }
  };

  const onResetSubAdminPassword = async (userId: string) => {
    const nextPassword = window.prompt(dictionary.admin.promptNewSubadminPassword);
    if (!nextPassword) {
      return;
    }

    try {
      setManagingSubAdmin(userId);
      setSubAdminMessage(null);
      await resetSubAdminPassword(userId, nextPassword, tokenRef.current);
      setSubAdminMessage(dictionary.admin.subadminPasswordUpdated);
    } catch (err) {
      setSubAdminMessage(err instanceof Error ? err.message : dictionary.admin.failedResetPassword);
    } finally {
      setManagingSubAdmin(null);
    }
  };

  const onDeleteSubAdmin = async (userId: string) => {
    const confirmed = window.confirm(dictionary.admin.confirmDeleteSubadmin);
    if (!confirmed) {
      return;
    }

    try {
      setManagingSubAdmin(userId);
      setSubAdminMessage(null);
      await deleteSubAdmin(userId, tokenRef.current);
      setSubAdminMessage(dictionary.admin.subadminDeleted);
      await loadUsers();
    } catch (err) {
      setSubAdminMessage(err instanceof Error ? err.message : dictionary.admin.failedDeleteSubadmin);
    } finally {
      setManagingSubAdmin(null);
    }
  };

  const onToggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const onLogout = () => {
    localStorage.removeItem("hamrobichar_token");
    localStorage.removeItem("hamrobichar_user");
    router.push(pathname.startsWith("/subadmin") ? "/subadmin" : "/master");
  };

  return (
    <section className="mx-auto my-6 w-full max-w-6xl space-y-6 px-4 lg:my-8 sm:px-6">
      {isSuperAdmin && isMasterRoute && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onLogout}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {dictionary.admin.logout}
            </button>
            <button
              onClick={() => setShowUserManagementPanel((prev) => !prev)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                showUserManagementPanel
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {dictionary.admin.userManagement}
            </button>
            <button
              onClick={() => setShowAccountSettingsPanel((prev) => !prev)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                showAccountSettingsPanel
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {dictionary.admin.accountSettings}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-black text-slate-900">{isEditing ? dictionary.admin.editArticle : dictionary.admin.createArticle}</h1>
          {!isMasterRoute && (
            <button onClick={onLogout} className="text-sm font-semibold text-rose-700">
              {dictionary.admin.logout}
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            required
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder={dictionary.admin.titlePlaceholder}
          />
          <input
            value={form.titleNp}
            onChange={(event) => setForm((prev) => ({ ...prev, titleNp: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder={dictionary.admin.nepaliTitlePlaceholder}
          />
          <p className="text-xs font-medium text-slate-500">
            {dictionary.admin.slugPreview}: <span className="font-semibold text-slate-700">{estimatedSlug || dictionary.admin.slugDefault}</span>
          </p>
          <input
            value={form.author}
            onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder={dictionary.admin.writerPlaceholder}
          />
          <div className="rounded-lg border border-slate-300 p-2">
            <div className="mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => execEditorCommand("bold")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                {dictionary.admin.bold}
              </button>
              <button
                type="button"
                onClick={() => execEditorCommand("italic")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                {dictionary.admin.italic}
              </button>
              <button
                type="button"
                onClick={() => execEditorCommand("underline")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                {dictionary.admin.underline}
              </button>
              <button
                type="button"
                onClick={() => execEditorCommand("formatBlock", "h2")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => execEditorCommand("formatBlock", "h3")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => execEditorCommand("formatBlock", "blockquote")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                {dictionary.admin.quote}
              </button>
              <button
                type="button"
                onClick={() => execEditorCommand("insertUnorderedList")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                {dictionary.admin.bulletList}
              </button>
              <button
                type="button"
                onClick={() => execEditorCommand("insertOrderedList")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                {dictionary.admin.numberedList}
              </button>
              <button
                type="button"
                onClick={addLink}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                {dictionary.admin.link}
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt(dictionary.admin.promptPasteImageUrl, "https://");
                  if (!url) {
                    return;
                  }

                  execEditorCommand("insertHTML", `<img src=\"${url}\" alt=\"${dictionary.admin.imageAlt}\" style=\"max-width:100%;height:auto;\" />`);
                }}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                {dictionary.admin.imageTag}
              </button>
              <button
                type="button"
                onClick={() => changeFontSize("increase")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                {dictionary.admin.fontIncrease}
              </button>
              <button
                type="button"
                onClick={() => changeFontSize("decrease")}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold"
              >
                {dictionary.admin.fontDecrease}
              </button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={syncEditorContent}
              dangerouslySetInnerHTML={{ __html: form.content || "" }}
              className="min-h-52 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
              data-placeholder={dictionary.admin.editorPlaceholder}
            />
            <p className="mt-1 text-xs text-slate-500">{dictionary.admin.editorHelp}</p>

            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-slate-500">{dictionary.admin.livePreview}</p>
              <div className="prose prose-slate max-w-none rounded bg-white p-3 text-sm" dangerouslySetInnerHTML={{ __html: form.content || `<p>${dictionary.admin.previewPlaceholder}</p>` }} />
            </div>
          </div>
          <textarea
            value={form.contentNp}
            onChange={(event) => setForm((prev) => ({ ...prev, contentNp: event.target.value }))}
            rows={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder={dictionary.admin.nepaliContentPlaceholder}
          />
          <input
            list="category-suggestions"
            required
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder={dictionary.admin.categoryPlaceholder}
          />
          <input
            value={form.categoryNp}
            onChange={(event) => setForm((prev) => ({ ...prev, categoryNp: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder={dictionary.admin.nepaliCategoryPlaceholder}
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
            placeholder={dictionary.admin.imageUrlPlaceholder}
          />
          <div className="space-y-1">
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {uploadingImage && <p className="text-xs text-slate-500">{dictionary.admin.uploadingImage}</p>}
          </div>

          {error && <p className="text-sm font-semibold text-rose-700">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? dictionary.admin.submitting : isEditing ? dictionary.admin.updateArticle : dictionary.admin.createArticleAction}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                {dictionary.admin.cancelEdit}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-slate-900">{dictionary.admin.existingArticles}</h2>
        <div className="mt-4">
          <input
            value={articleSearchTerm}
            onChange={(event) => setArticleSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder={dictionary.admin.searchArticlesPlaceholder}
          />
        </div>

        {loading ? (
          <p className="mt-4 text-slate-600">{dictionary.admin.loadingArticles}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {groupedFilteredArticles.length === 0 && <p className="text-slate-500">{dictionary.admin.noArticlesFound}</p>}

            {groupedFilteredArticles.map(([category, categoryArticles]) => {
              const isOpen = openCategories[category] ?? false;

              return (
                <div key={category} className="rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => onToggleCategory(category)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="font-bold text-slate-800">{category}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {categoryArticles.length} {categoryArticles.length > 1 ? dictionary.admin.articleCountLabelPlural : dictionary.admin.articleCountLabel} {isOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {isOpen && (
                    <ul className="space-y-2 border-t border-slate-200 px-3 py-3">
                      {categoryArticles.map((article) => (
                        <li key={article._id} className="rounded-lg border border-slate-200 p-3">
                          <p className="font-bold text-slate-800">{article.title}</p>
                          <p className="text-xs text-slate-500">{dictionary.admin.authorLabel}: {article.author}</p>
                          <div className="mt-2 flex gap-3 text-sm font-semibold">
                            <button
                              onClick={() => onEdit(article)}
                              disabled={!canModifyArticle(article)}
                              className="text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {dictionary.admin.edit}
                            </button>
                            <button
                              onClick={() => void onDelete(article._id)}
                              disabled={!isSuperAdmin}
                              className="text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {dictionary.admin.delete}
                            </button>
                          </div>
                          {!isSuperAdmin && !canModifyArticle(article) && (
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {dictionary.admin.ownArticlesOnly}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isSuperAdmin && (
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-black text-slate-900">{dictionary.admin.createSubadmin}</h2>
          <p className="mt-1 text-sm text-slate-600">{dictionary.admin.createSubadminHelp}</p>

          <form onSubmit={onCreateSubAdmin} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              required
              value={subAdminForm.username}
              onChange={(event) => setSubAdminForm((prev) => ({ ...prev, username: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
              placeholder={dictionary.admin.username}
            />
            <input
              type="email"
              required
              value={subAdminForm.email}
              onChange={(event) => setSubAdminForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
              placeholder={dictionary.admin.email}
            />
            <input
              type="password"
              required
              minLength={6}
              value={subAdminForm.password}
              onChange={(event) => setSubAdminForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
              placeholder={dictionary.admin.password}
            />
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={creatingSubAdmin}
                className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingSubAdmin ? dictionary.admin.creating : dictionary.admin.createSubadminAction}
              </button>
            </div>
          </form>

          {subAdminMessage && <p className="mt-3 text-sm font-semibold text-slate-700">{subAdminMessage}</p>}
        </div>
      )}

      {isSuperAdmin && showUserManagementPanel && (
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-slate-900">{dictionary.admin.userManagement}</h2>
        {usersLoading ? (
          <p className="mt-4 text-slate-600">{dictionary.admin.usersLoading}</p>
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
                    {user.role === "subadmin" ? dictionary.admin.makeUser : dictionary.admin.makeSubadmin}
                  </button>
                  {user.role === "subadmin" && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => onResetSubAdminPassword(user._id)}
                        disabled={managingSubAdmin === user._id}
                        className="rounded border border-blue-300 px-2 py-1 text-xs font-semibold text-blue-700 disabled:opacity-50"
                      >
                        {dictionary.admin.resetPassword}
                      </button>
                      <button
                        onClick={() => onDeleteSubAdmin(user._id)}
                        disabled={managingSubAdmin === user._id}
                        className="rounded border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 disabled:opacity-50"
                      >
                        {dictionary.admin.deleteSubadmin}
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
                  <th className="py-2 pr-3">{dictionary.admin.username}</th>
                  <th className="py-2 pr-3">{dictionary.admin.email}</th>
                  <th className="py-2 pr-3">{dictionary.admin.role}</th>
                  <th className="py-2">{dictionary.admin.action}</th>
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
                          {user.role === "subadmin" ? dictionary.admin.makeUser : dictionary.admin.makeSubadmin}
                        </button>
                        {user.role === "subadmin" && (
                          <>
                            <button
                              onClick={() => onResetSubAdminPassword(user._id)}
                              disabled={managingSubAdmin === user._id}
                              className="rounded border border-blue-300 px-2 py-1 text-xs font-semibold text-blue-700 disabled:opacity-50"
                            >
                              {dictionary.admin.resetPassword}
                            </button>
                            <button
                              onClick={() => onDeleteSubAdmin(user._id)}
                              disabled={managingSubAdmin === user._id}
                              className="rounded border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 disabled:opacity-50"
                            >
                              {dictionary.admin.deleteSubadmin}
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

      {(showAccountSettingsPanel || !isMasterRoute) && (
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-slate-900">{dictionary.admin.accountSettings}</h2>
        <p className="mt-1 text-sm text-slate-600">{dictionary.admin.accountHelp}</p>

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
            placeholder={dictionary.admin.currentPasswordPlaceholder}
          />
          <input
            type="password"
            required
            value={passwordForm.newPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring"
            placeholder={dictionary.admin.newPasswordPlaceholder}
          />
          <input
            type="password"
            required
            value={passwordForm.confirmPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-rose-300 focus:ring sm:col-span-2"
            placeholder={dictionary.admin.confirmPasswordPlaceholder}
          />

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changingPassword ? dictionary.admin.changingPassword : dictionary.admin.changePassword}
            </button>
          </div>
        </form>
        ) : (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {dictionary.admin.subadminPasswordManaged}
          </p>
        )}

        {accountMessage && <p className="mt-3 text-sm font-semibold text-slate-700">{accountMessage}</p>}
      </div>
      )}
    </section>
  );
}
