"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { FaDownload, FaExclamationTriangle, FaSpinner, FaWhatsapp } from "react-icons/fa";
import { urlFor } from "../sanityStudio/lib/sanity";
import type { NewsPost, SanityImage } from "../types/content";

export default function NewsCard({ post }: { post: NewsPost }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const headlineLength = post.title?.length || 0;
  const headlineSize = headlineLength > 220
    ? "text-[44px]"
    : headlineLength > 160
      ? "text-[52px]"
      : headlineLength > 100
        ? "text-[62px]"
        : "text-[74px]";

  // Helper: Use our API Proxy to get the image safely
  const getSafeImageUrl = (source: SanityImage) => {
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
        className={`w-full rounded-lg border px-4 py-3 text-sm font-bold shadow-sm transition disabled:cursor-wait disabled:opacity-75 ${
          error ? "border-red-700 bg-red-600 text-white" : "border-green-700 bg-[#25D366] text-white hover:bg-green-600"
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? <FaSpinner className="animate-spin" /> : error ? <FaExclamationTriangle /> : <FaDownload />}
          {loading ? "Creating status..." : error ? "Try again" : "Download WhatsApp Status"}
          {!loading && !error && <FaWhatsapp className="text-base" />}
        </span>
      </button>

      {/* HIDDEN CARD */}
      <div className="fixed top-0 left-[-9999px] -z-50 w-[1080px] h-[1920px] pointer-events-none opacity-0 overflow-hidden">
        <div 
          ref={cardRef} 
          className="w-[1080px] h-[1920px] bg-[#101114] relative overflow-hidden"
        >
            {/* BACKGROUND */}
            <div className="absolute inset-0 z-0">
              {post.mainImage ? (
                // Use the PROXY URL here
                <img 
                  src={getSafeImageUrl(post.mainImage)} 
                  alt="bg" 
                  className="w-full h-full object-cover opacity-75 scale-110"
                  crossOrigin="anonymous"
                />
              ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#b91c1c] via-[#101114] to-black"></div>
              )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/15 to-black"></div>
                <div className="absolute inset-x-0 bottom-0 h-[1080px] bg-gradient-to-t from-[#101114] via-[#101114]/80 to-transparent"></div>
            </div>

              {/* SECTION LABEL */}
              <div className="relative z-10 mx-14 mt-16 border-b border-white/50 pb-8">
                 <div className="flex items-center gap-4">
                   <img src="/logo.png" alt="TV10 India" className="h-20 w-20 rounded-full border-2 border-tv10-gold object-cover" />
                   <p className="text-4xl font-black tracking-tight text-white">TV10 INDIA</p>
                 </div>
                 <div className="absolute left-1/2 top-3 -translate-x-1/2 text-center text-2xl font-bold uppercase leading-none tracking-widest text-white">News</div>
            </div>

            {/* CONTENT */}
              <div className="absolute inset-x-0 bottom-[240px] z-10 px-14">
                 <div className="relative mb-8 h-12">
                   <span className="absolute left-1/2 -translate-x-1/2 text-center text-3xl font-black uppercase leading-none tracking-wider text-tv10-gold">
                 {post.category || "Breaking News"}
                   </span>
                 </div>
                 <h1 className={`py-1 text-center font-black leading-[1.08] tracking-tight text-white ${headlineSize}`}>
                 {post.title}
               </h1>
            </div>

            {/* FOOTER */}
              <div className="absolute inset-x-0 bottom-0 z-10">
                <div className="h-5 w-full bg-tv10-red"></div>
                <div className="grid grid-cols-2 items-end bg-white px-14 py-9">
                  <div className="text-left">
                    <p className="mb-2 text-2xl font-bold uppercase tracking-[0.15em] text-gray-500">
                       {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-3xl font-black tracking-tight text-tv10-metal">
                     tv10-india.vercel.app
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mb-2 text-2xl font-bold uppercase tracking-wider text-tv10-red">Follow TV10 India</p>
                    <p className="text-3xl font-black tracking-tight text-black">NEWS THAT MATTERS</p>
                  </div>
               </div>
            </div>

        </div>
      </div>

    </div>
  );
}