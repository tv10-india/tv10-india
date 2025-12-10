"use client";

import { useState, useEffect } from "react";

export default function LanguageToggle() {
  const [currentLang, setCurrentLang] = useState("hi");

  useEffect(() => {
    // Check the cookie to see what the current language is
    const cookies = document.cookie.split(";");
    const langCookie = cookies.find((c) => c.trim().startsWith("googtrans="));
    
    if (langCookie) {
      // Example value: /auto/en -> We extract 'en'
      const langCode = langCookie.split("/").pop();
      if (langCode === "en") {
        setCurrentLang("en");
      }
    }
  }, []);

  const switchLanguage = (lang: string) => {
    // 1. Set the special Google Cookie
    // We set it for both root path and domain to ensure it sticks
    document.cookie = `googtrans=/auto/${lang}; path=/;`;
    document.cookie = `googtrans=/auto/${lang}; path=/; domain=${window.location.hostname}`;

    // 2. Reload the page to apply translation
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