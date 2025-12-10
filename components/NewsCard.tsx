"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { FaWhatsapp, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { urlFor } from "@/lib/sanity";

export default function NewsCard({ post }: { post: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Helper: Use our API Proxy to get the image safely
  const getSafeImageUrl = (source: any) => {
    const originalUrl = urlFor(source).url();
    // This calls our local API "Tunnel"
    return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    setError(false);

    try {
      // 1. Wait a moment for the Proxy Image to render in the hidden DOM
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 2. Capture the card
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,        // Now works because our API adds the right headers
        allowTaint: true,
        backgroundColor: "#000000",
        scale: 2,             // High Quality
        logging: false,
      });

      // 3. Download
      const link = document.createElement("a");
      link.download = `TV10-${post.slug.current}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate card", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6">
      
      {/* BUTTON */}
      <button 
        onClick={handleDownload}
        disabled={loading}
        className={`w-full font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition transform ${
          error ? "bg-red-600 text-white" : "bg-gradient-to-r from-green-600 to-green-500 text-white"
        }`}
      >
        {loading ? <FaSpinner className="animate-spin" /> : error ? <FaExclamationTriangle /> : <FaWhatsapp className="text-xl" />}
        {loading ? "Generating Card..." : error ? "Try Again" : "Download WhatsApp Status"}
      </button>

      {/* HIDDEN CARD */}
      <div className="fixed top-0 left-0 -z-50 w-[1080px] h-[1920px] pointer-events-none opacity-0">
        <div 
          ref={cardRef} 
          className="w-[1080px] h-[1920px] bg-black relative flex flex-col justify-between overflow-hidden"
        >
            {/* BACKGROUND */}
            <div className="absolute inset-0 z-0">
              {post.mainImage ? (
                // Use the PROXY URL here
                <img 
                  src={getSafeImageUrl(post.mainImage)} 
                  alt="bg" 
                  className="w-full h-full object-cover opacity-60"
                  crossOrigin="anonymous"
                />
              ) : (
                 <div className="w-full h-full bg-gradient-to-br from-tv10-red to-black"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-90"></div>
            </div>

            {/* LOGO */}
            <div className="relative z-10 p-10 flex justify-center pt-32">
               <div className="bg-tv10-red text-white px-10 py-4 rounded-full font-black text-5xl shadow-2xl border-4 border-white tracking-tighter">
                  TV10 INDIA
               </div>
            </div>

            {/* CONTENT */}
            <div className="relative z-10 px-16 mb-auto mt-40">
               <span className="bg-tv10-gold text-black px-8 py-3 text-4xl font-bold uppercase rounded-lg mb-8 inline-block shadow-lg">
                 {post.category || "Breaking News"}
               </span>
               <h1 className="text-white text-[7rem] font-black leading-tight drop-shadow-2xl line-clamp-4">
                 {post.title}
               </h1>
            </div>

            {/* FOOTER */}
            <div className="relative z-10 mt-auto">
               <div className="bg-gradient-to-r from-tv10-red to-tv10-gold h-6 w-full"></div>
               <div className="bg-white py-14 px-16 flex items-center justify-between">
                  <div>
                    <p className="text-4xl text-gray-500 font-bold mb-4 uppercase tracking-widest">
                       {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-6xl font-black text-tv10-metal tracking-tighter">
                      www.tv10india.com
                    </p>
                  </div>
                  <div className="text-right">
                     <p className="text-4xl font-bold text-tv10-red mb-2">Follow for Truth</p>
                     <p className="text-5xl font-black text-black">YouTube • FB</p>
                  </div>
               </div>
            </div>

        </div>
      </div>

    </div>
  );
}