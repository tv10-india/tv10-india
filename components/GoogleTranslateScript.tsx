"use client";

import { useEffect } from "react";

export default function GoogleTranslateScript() {
  useEffect(() => {
    // 1. Initialize Google Translate (Hidden Mode)
    // @ts-ignore
    window.googleTranslateElementInit = () => {
      // @ts-ignore
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "hi", // Original language is Hindi
          includedLanguages: "en,hi", // Only allow English and Hindi
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // 2. Load the Script
    if (!document.querySelector("#google-translate-script")) {
      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.id = "google-translate-script";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // We return a hidden div because the script needs a target
  return <div id="google_translate_element" className="hidden"></div>;
}