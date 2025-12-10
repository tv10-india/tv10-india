"use client";

import { useEffect } from "react";

export default function AdBanner() {
  
  useEffect(() => {
    try {
      // This function calls Google to say: "Hey, fill this box with an ad now!"
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense Error:", err);
    }
  }, []);

  return (
    <div className="my-6 mx-auto overflow-hidden text-center bg-gray-50 min-h-[100px] flex justify-center items-center">
      {/* 2. DISPLAY THE AD SLOT */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8748522674365627" // <--- YOUR PUBLISHER ID
        data-ad-slot="5172933029"                // <--- YOUR SLOT ID
        data-ad-format="auto"                    // <--- Allows Google to pick the best size
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}