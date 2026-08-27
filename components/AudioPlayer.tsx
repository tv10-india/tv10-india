"use client";

import { useEffect, useRef, useState } from "react";
import { FaHeadphones, FaPause, FaPlay, FaStop } from "react-icons/fa";

function splitText(text: string): string[] {
  const sentences = text.split(/(?<=[.?!।॥])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const part = sentence.trim();
    if (!part) continue;
    if (current && current.length + part.length + 1 > 200) {
      chunks.push(current);
      current = part;
    } else {
      current += `${current ? " " : ""}${part}`;
    }
  }

  if (current) chunks.push(current);
  return chunks.length ? chunks : [text.trim()];
}

export default function AudioPlayer({ text }: { text: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const chunksRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      audioRef.current?.pause();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const playChunk = async (index: number, requestId: number) => {
    const chunks = chunksRef.current;
    if (index >= chunks.length || requestId !== requestIdRef.current) {
      setStatus("idle");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chunks[index], languageCode: "hi-IN" }),
      });
      if (!response.ok) throw new Error("Free TTS request failed");

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = URL.createObjectURL(await response.blob());
      const audio = audioRef.current || new Audio();
      audioRef.current = audio;
      audio.src = objectUrlRef.current;
      audio.onended = () => {
        indexRef.current = index + 1;
        void playChunk(index + 1, requestId);
      };
      audio.onerror = () => setStatus("idle");
      indexRef.current = index;
      setStatus("playing");
      await audio.play();
    } catch {
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = "hi-IN";
      utterance.rate = 0.9;
      utterance.onend = () => {
        indexRef.current = index + 1;
        void playChunk(index + 1, requestId);
      };
      setStatus("playing");
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePlay = () => {
    if (status === "paused") {
      audioRef.current?.play();
      window.speechSynthesis.resume();
      setStatus("playing");
      return;
    }

    const chunks = splitText(text);
    if (!chunks[0]) return;
    chunksRef.current = chunks;
    indexRef.current = 0;
    requestIdRef.current += 1;
    window.speechSynthesis.cancel();
    audioRef.current?.pause();
    void playChunk(0, requestIdRef.current);
  };

  const handlePause = () => {
    audioRef.current?.pause();
    window.speechSynthesis.pause();
    setStatus("paused");
  };

  const handleStop = () => {
    requestIdRef.current += 1;
    audioRef.current?.pause();
    window.speechSynthesis.cancel();
    setStatus("idle");
  };

  return (
    <div className="bg-gradient-to-r from-tv10-metal to-gray-900 text-white p-4 rounded-xl shadow-lg border-l-4 border-tv10-gold flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className={`bg-tv10-red p-3 rounded-full shadow-md ${status === "playing" ? "animate-pulse" : ""}`}>
          <FaHeadphones className="text-lg" />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AI News Reader</p>
          <p className="text-sm md:text-base font-bold text-white">
            {status === "loading" ? "Audio loading..." : "खबर सुनें (Listen Now)"}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        {status !== "playing" && (
          <button onClick={handlePlay} className="bg-white text-tv10-red h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center" aria-label="Play news">
            <FaPlay className="ml-1 text-sm md:text-lg" />
          </button>
        )}
        {status === "playing" && (
          <button onClick={handlePause} className="bg-white text-black h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center" aria-label="Pause news">
            <FaPause className="text-sm md:text-lg" />
          </button>
        )}
        {(status === "playing" || status === "loading" || status === "paused") && (
          <button onClick={handleStop} className="bg-gray-700 text-white h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center" aria-label="Stop news">
            <FaStop className="text-sm md:text-lg" />
          </button>
        )}
      </div>
    </div>
  );
}
