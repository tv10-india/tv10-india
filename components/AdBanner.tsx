"use client";

import { useEffect, useRef } from "react";

export default function AdBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || el.offsetWidth === 0) return;

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense Error:", err);
    }
  }, []);

  return (
    <div ref={containerRef} className="my-6 w-full overflow-hidden text-center bg-gray-50 dark:bg-gray-900 min-h-[100px]">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-8748522674365627"
        data-ad-slot="5172933029"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}