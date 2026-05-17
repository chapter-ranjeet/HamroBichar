"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { dictionaries, Dictionary, LANGUAGE_COOKIE, Language } from "@/lib/i18n";

type LanguageContextValue = {
  language: Language;
  dictionary: Dictionary;
  setLanguage: (next: Language) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = {
  initialLanguage: Language;
  children: React.ReactNode;
};

export default function LanguageProvider({ initialLanguage, children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language === "np" ? "ne" : "en";
    window.localStorage.setItem(LANGUAGE_COOKIE, language);
    document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=31536000; samesite=lax`;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      dictionary: dictionaries[language],
      setLanguage,
      toggleLanguage: () => setLanguage((prev) => (prev === "en" ? "np" : "en"))
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
};
