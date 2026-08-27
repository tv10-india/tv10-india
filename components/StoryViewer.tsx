"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { urlFor } from "../sanityStudio/lib/sanity";
import type { WebStory } from "../types/content";

export default function StoryViewer({ story, nextStoryId, prevStoryId }: { story: WebStory; nextStoryId?: string | null; prevStoryId?: string | null }) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const totalSlides = story.slides?.length || 0;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function goNext() {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
      setProgress(0);
    } else if (nextStoryId) {
      router.push(`/web-stories/${nextStoryId}`);
    } else {
      router.push("/");
    }
  }

  function goPrev() {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setProgress(0);
    } else if (prevStoryId) {
      router.push(`/web-stories/${prevStoryId}`);
    }
  }

  // Auto-advance timer
  useEffect(() => {
    setProgress(0);
    timerRef.current = setInterval(() => {
      setProgress((p) => p + 2);
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSlide]);

  // When progress fills, advance
  useEffect(() => {
    if (progress >= 100) {
      if (timerRef.current) clearInterval(timerRef.current);
      goNext();
    }
  }, [progress]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        router.push("/");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, totalSlides]);

  // Tap zones: left third = prev, rest = next
  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      goPrev();
    } else {
      goNext();
    }
  }

  if (!totalSlides) return null;

  const slide = story.slides[currentSlide];

  return (
    <main className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 z-50 text-white bg-black/60 backdrop-blur-sm p-2.5 rounded-full hover:bg-white/20 transition"
      >
        <FaTimes size={22} />
      </button>

      <div className="relative w-full h-full md:w-[400px] md:h-[750px] bg-gray-900 md:rounded-2xl overflow-hidden shadow-2xl select-none">

        {/* PROGRESS BARS */}
        <div className="absolute top-0 left-0 w-full z-40 flex gap-1 px-2 pt-3">
          {story.slides.map((_, i: number) => (
            <div key={i} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: i < currentSlide ? "100%" : i === currentSlide ? `${progress}%` : "0%",
                  transition: i === currentSlide ? "width 100ms linear" : "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* SLIDE COUNTER */}
        <div className="absolute top-4 left-3 z-40 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
          {currentSlide + 1} / {totalSlides}
        </div>

        {/* SLIDE - Tap zones */}
        <div className="relative w-full h-full cursor-pointer" onClick={handleTap}>
          <Image
            src={urlFor(slide).url()}
            alt={`Slide ${currentSlide + 1}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

          <div className="absolute bottom-8 left-0 w-full p-6 text-center">
            <h2 className="text-white font-bold text-lg md:text-xl drop-shadow-md mb-2">{story.title}</h2>
            {slide.caption && (
              <p className="text-gray-200 text-sm">{slide.caption}</p>
            )}
            <p className="mt-3 text-white/40 text-xs">Tap to continue</p>
          </div>
        </div>

        {/* NAV BUTTONS (desktop) */}
        {currentSlide > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/80 text-white p-2.5 rounded-full hidden md:flex items-center justify-center transition"
          >
            <FaChevronLeft size={14} />
          </button>
        )}
        {currentSlide < totalSlides - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/80 text-white p-2.5 rounded-full hidden md:flex items-center justify-center transition"
          >
            <FaChevronRight size={14} />
          </button>
        )}

      </div>
    </main>
  );
}
