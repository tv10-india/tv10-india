"use client";

import { useState, useEffect } from "react";

// Must match `pageLanguage` in GoogleTranslateScript.tsx
const SOURCE_LANG = "hi";

// Google (and we) can write googtrans on several scopes. To switch reliably we
// have to touch every one of them, otherwise a leftover copy keeps winning.
function cookieDomains() {
  const host = window.location.hostname;
  const domains: (string | null)[] = [null, host, `.${host}`];

  const parts = host.split(".");
  if (parts.length > 2) {
    const root = parts.slice(-2).join(".");
    domains.push(root, `.${root}`);
  }

  return domains;
}

function clearTranslateCookie() {
  for (const domain of cookieDomains()) {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;${
      domain ? ` domain=${domain};` : ""
    }`;
  }
}

function setTranslateCookie(lang: string) {
  for (const domain of cookieDomains()) {
    document.cookie = `googtrans=/auto/${lang}; path=/;${
      domain ? ` domain=${domain};` : ""
    }`;
  }
}

function readLang() {
  // A #googtrans(hi|en) hash beats the cookie, so it has to be checked first.
  const hash = window.location.hash.match(/#googtrans\(([^)]+)\)/);
  if (hash) {
    const target = hash[1].split("|").pop();
    if (target) return target;
  }

  const langCookie = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("googtrans="));

  // No cookie means untranslated, i.e. the original Hindi page.
  if (!langCookie) return SOURCE_LANG;

  // Example value: /auto/en -> We extract 'en'
  return decodeURIComponent(langCookie.split("=")[1]).split("/").pop() || SOURCE_LANG;
}

export default function LanguageToggle() {
  const [currentLang, setCurrentLang] = useState(SOURCE_LANG);

  useEffect(() => {
    setCurrentLang(readLang());
  }, []);

  const switchLanguage = (lang: string) => {
    // 1. Wipe every existing googtrans cookie. Going back to the original
    // language means *no* cookie -- "/auto/hi" would leave us translated.
    clearTranslateCookie();

    if (lang !== SOURCE_LANG) {
      setTranslateCookie(lang);
    }

    // 2. Drop any #googtrans(...) hash Google left behind, or it will override
    // the cookie on reload and pin the page to the old language.
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    // 3. Reload the page to apply translation
    window.location.reload();
  };

  return (
    <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 text-xs font-bold border border-gray-300 dark:border-gray-600">

      {/* HINDI BUTTON */}
      <button
        onClick={() => switchLanguage("hi")}
        className={`px-3 py-1 rounded-full transition-all ${
          currentLang === "hi"
            ? "bg-tv10-red text-white shadow-md"
            : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
        }`}
      >
        HI
      </button>

      {/* ENGLISH BUTTON */}
      <button
        onClick={() => switchLanguage("en")}
        className={`px-3 py-1 rounded-full transition-all ${
          currentLang === "en"
            ? "bg-tv10-gold text-black shadow-md"
            : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
        }`}
      >
        EN
      </button>

    </div>
  );
}
