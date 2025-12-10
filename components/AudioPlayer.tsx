"use client";

import { useState, useEffect } from "react";
import { FaPlay, FaPause, FaStop, FaVolumeUp, FaHeadphones } from "react-icons/fa";

export default function AudioPlayer({ text }: { text: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [hindiVoice, setHindiVoice] = useState<SpeechSynthesisVoice | null>(null);

  // 1. FIND THE BEST HINDI VOICE
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      
      // Look for specific high-quality Hindi voices first
      const bestVoice = 
        voices.find((v) => v.name.includes("Google हिन्दी")) || // Android/Chrome Best
        voices.find((v) => v.name.includes("Lekha")) ||         // Mac Best
        voices.find((v) => v.name.includes("Hemant")) ||        // Windows Best
        voices.find((v) => v.lang === "hi-IN");                 // Fallback

      setHindiVoice(bestVoice || null);
    };

    loadVoices();
    
    // Chrome loads voices asynchronously, so we must listen for the event
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    } else {
      // 2. PREPARE THE NEWS REPORT
      // We assume 'text' contains "Title. Body."
      const u = new SpeechSynthesisUtterance(text);
      
      if (hindiVoice) {
        u.voice = hindiVoice;
      }
      u.lang = 'hi-IN'; 
      u.rate = 0.9;  // 0.9 is perfect for News Reading (Clear & Steady)
      u.pitch = 1;

      u.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      setUtterance(u);
      window.speechSynthesis.speak(u);
      setIsSpeaking(true);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  if (!hindiVoice && typeof window !== 'undefined') {
    // Optional: Hide player if no Hindi voice is found on the device
    // return null; 
  }

  return (
    <div className="bg-gradient-to-r from-tv10-metal to-gray-900 text-white p-4 rounded-xl shadow-lg border-l-4 border-tv10-gold flex items-center justify-between gap-4 mb-6">
      
      <div className="flex items-center gap-4">
        <div className="bg-tv10-red p-3 rounded-full animate-pulse shadow-md">
           <FaHeadphones className="text-lg" />
        </div>
        <div>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AI News Reader</p>
           <p className="text-sm md:text-base font-bold text-white">खबर सुनें (Listen Now)</p>
        </div>
      </div>

      <div className="flex gap-3">
        {!isSpeaking || isPaused ? (
          <button 
            onClick={handlePlay} 
            className="bg-white text-tv10-red h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg"
            title="Play News"
          >
            <FaPlay className="ml-1 text-sm md:text-lg" />
          </button>
        ) : (
          <button 
            onClick={handlePause} 
            className="bg-white text-black h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center hover:bg-gray-200 transition shadow-lg"
            title="Pause"
          >
            <FaPause className="text-sm md:text-lg" />
          </button>
        )}
        
        {(isSpeaking || isPaused) && (
          <button 
            onClick={handleStop} 
            className="bg-gray-700 text-white h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
            title="Stop"
          >
            <FaStop className="text-sm md:text-lg" />
          </button>
        )}
      </div>

    </div>
  );
}