export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="flex w-full flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p>© {new Date().getFullYear()} HamroBichar. Independent news for Nepal.</p>
        <p>
          Managed by{" "}
          <a
            href="https://www.instagram.com/chapter_ranjeet/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-rose-700 transition hover:text-rose-800"
          >
            @chapter_ranjeet
          </a>
        </p>
      </div>
    </footer>
  );
}
