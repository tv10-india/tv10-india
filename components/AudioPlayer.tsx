"use client";

import { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause, FaStop, FaHeadphones } from "react-icons/fa";

const SPEEDS = [0.75, 1, 1.25, 1.5] as const;
type Speed = (typeof SPEEDS)[number];

function getActiveLang(): "hi" | "en" {
  const cookie = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("googtrans="));
  if (cookie && cookie.split("/").pop() === "en") return "en";
  return "hi";
}

function getArticleTextFromDOM(): string {
  const el = document.getElementById("article-body");
  return el ? el.innerText.trim() : "";
}

function splitIntoChunks(text: string): string[] {
  const sentences = text.split(/(?<=[.?!।॥])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (current.length + trimmed.length + 1 > 200 && current.length > 0) {
      chunks.push(current.trim());
      current = trimmed;
    } else {
      current += (current ? " " : "") + trimmed;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

function estimateListenTime(text: string, speed: Speed): number {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / (130 * speed)));
}

function findVoice(
  voices: SpeechSynthesisVoice[],
  lang: "hi" | "en"
): SpeechSynthesisVoice | null {
  if (lang === "en") {
    return (
      voices.find((v) => v.name.includes("Google US English")) ||
      voices.find((v) => v.name.includes("Google UK English")) ||
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang === "en-GB") ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null
    );
  }
  return (
    voices.find((v) => v.name.includes("Google हिन्दी")) ||
    voices.find((v) => v.name.includes("Lekha")) ||
    voices.find((v) => v.name.includes("Hemant")) ||
    voices.find((v) => v.lang === "hi-IN") ||
    voices.find((v) => v.lang.startsWith("hi")) ||
    null
  );
}

export default function AudioPlayer({ text }: { text: string }) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [lang, setLang] = useState<"hi" | "en">("hi");
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [speed, setSpeed] = useState<Speed>(1);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  const chunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef(0);
  const speedRef = useRef<Speed>(1);
  const langRef = useRef<"hi" | "en">("hi");
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const stoppedRef = useRef(false);

  speedRef.current = speed;
  langRef.current = lang;
  voicesRef.current = voices;

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    setLang(getActiveLang());

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  function speakFrom(index: number) {
    const chunks = chunksRef.current;
    if (index >= chunks.length || stoppedRef.current) {
      setStatus("idle");
      setCurrentChunk(0);
      currentChunkRef.current = 0;
      return;
    }

    const activeLang = langRef.current;
    const voice = findVoice(voicesRef.current, activeLang);

    const u = new SpeechSynthesisUtterance(chunks[index]);
    if (voice) u.voice = voice;
    u.lang = activeLang === "en" ? "en-US" : "hi-IN";
    u.rate = (activeLang === "en" ? 1 : 0.9) * speedRef.current;
    u.pitch = 1;

    u.onend = () => {
      if (stoppedRef.current) return;
      const next = index + 1;
      currentChunkRef.current = next;
      setCurrentChunk(next);
      speakFrom(next);
    };

    u.onerror = () => {
      if (stoppedRef.current) return;
    };

    currentChunkRef.current = index;
    setCurrentChunk(index);
    window.speechSynthesis.speak(u);
  }

  const handlePlay = () => {
    if (status === "paused") {
      stoppedRef.current = false;
      setStatus("playing");
      speakFrom(currentChunkRef.current);
      return;
    }

    const activeLang = getActiveLang();
    setLang(activeLang);
    langRef.current = activeLang;

    let speechText = text;
    if (activeLang === "en") {
      const domText = getArticleTextFromDOM();
      if (domText) speechText = domText;
    }

    const chunks = splitIntoChunks(speechText);
    chunksRef.current = chunks;
    currentChunkRef.current = 0;
    stoppedRef.current = false;
    setTotalChunks(chunks.length);
    setCurrentChunk(0);
    setStatus("playing");

    window.speechSynthesis.cancel();
    speakFrom(0);
  };

  const handlePause = () => {
    stoppedRef.current = true;
    window.speechSynthesis.cancel();
    setStatus("paused");
  };

  const handleStop = () => {
    stoppedRef.current = true;
    window.speechSynthesis.cancel();
    setStatus("idle");
    currentChunkRef.current = 0;
    setCurrentChunk(0);
  };

  const handleSpeedChange = (newSpeed: Speed) => {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;

    if (status === "playing") {
      stoppedRef.current = true;
      window.speechSynthesis.cancel();
      stoppedRef.current = false;
      setStatus("playing");
      speakFrom(currentChunkRef.current);
    }
  };

  if (isSupported === false) {
    return (
      <div
        className="bg-gradient-to-r from-tv10-metal to-gray-900 text-white p-4 rounded-xl shadow-lg border-l-4 border-tv10-gold flex items-center gap-4 mb-6"
        role="region"
        aria-label="Audio player unavailable"
      >
        <div className="bg-gray-600 p-3 rounded-full shadow-md">
          <FaHeadphones className="text-lg" />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            AI News Reader
          </p>
          <p className="text-sm font-medium text-gray-300">
            आपके ब्राउज़र पर वॉइस उपलब्ध नहीं है
          </p>
          <p className="text-xs text-gray-500">
            (Voice not supported on this browser)
          </p>
        </div>
      </div>
    );
  }

  if (isSupported === null) return null;

  const progressPercent =
    totalChunks > 0 ? Math.round((currentChunk / totalChunks) * 100) : 0;
  const estimatedTime = estimateListenTime(text, speed);
  const isActive = status === "playing" || status === "paused";
  const label = lang === "en" ? "Listen Now" : "खबर सुनें (Listen Now)";
  const langBadge = lang === "en" ? "EN" : "HI";

  return (
    <div
      className="bg-gradient-to-r from-tv10-metal to-gray-900 text-white p-4 rounded-xl shadow-lg border-l-4 border-tv10-gold mb-6"
      role="region"
      aria-label="AI News Reader audio player"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`bg-tv10-red p-3 rounded-full shadow-md ${status === "playing" ? "animate-pulse" : ""}`}
          >
            <FaHeadphones className="text-lg" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              AI News Reader
            </p>
            <p className="text-sm md:text-base font-bold text-white">
              {label}
              <span className="ml-2 text-[10px] font-medium text-tv10-gold bg-white/10 px-2 py-0.5 rounded-full">
                ~{estimatedTime} min
              </span>
              <span className="ml-1 text-[10px] font-medium text-white bg-tv10-red/80 px-2 py-0.5 rounded-full">
                {langBadge}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {status !== "playing" ? (
            <button
              onClick={handlePlay}
              className="bg-white text-tv10-red h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg"
              aria-label={status === "paused" ? "Resume playback" : "Play news article"}
            >
              <FaPlay className="ml-1 text-sm md:text-lg" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="bg-white text-black h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center hover:bg-gray-200 transition shadow-lg"
              aria-label="Pause playback"
            >
              <FaPause className="text-sm md:text-lg" />
            </button>
          )}

          {isActive && (
            <button
              onClick={handleStop}
              className="bg-gray-700 text-white h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
              aria-label="Stop playback"
            >
              <FaStop className="text-sm md:text-lg" />
            </button>
          )}
        </div>
      </div>

      {isActive && totalChunks > 0 && (
        <div
          className="mt-3 h-[3px] bg-white/30 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Playback progress: ${progressPercent}%`}
        >
          <div
            className="h-full bg-tv10-gold rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {isActive && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Speed
          </span>
          <div className="flex items-center bg-gray-700 rounded-full p-0.5 text-[10px] font-bold">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  speed === s
                    ? "bg-tv10-gold text-black shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
                aria-label={`Set playback speed to ${s}x`}
                aria-pressed={speed === s}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
