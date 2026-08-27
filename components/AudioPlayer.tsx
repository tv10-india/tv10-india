"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaPause, FaStop, FaHeadphones } from "react-icons/fa";

const SPEEDS = [0.75, 1, 1.25, 1.5] as const;
type Speed = (typeof SPEEDS)[number];

const HINDI_WORDS_PER_MINUTE = 130;

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

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

function estimateListenTime(text: string, speed: Speed): number {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = wordCount / (HINDI_WORDS_PER_MINUTE * speed);
  return Math.max(1, Math.round(minutes));
}

export default function AudioPlayer({ text }: { text: string }) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [hindiVoice, setHindiVoice] = useState<SpeechSynthesisVoice | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const chunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [completedChunks, setCompletedChunks] = useState(0);

  const [speed, setSpeed] = useState<Speed>(1);
  const [estimatedTime, setEstimatedTime] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      const bestVoice =
        voices.find((v) => v.name.includes("Google हिन्दी")) ||
        voices.find((v) => v.name.includes("Lekha")) ||
        voices.find((v) => v.name.includes("Hemant")) ||
        voices.find((v) => v.lang === "hi-IN") ||
        voices.find((v) => v.lang.startsWith("hi"));

      setHindiVoice(bestVoice || null);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    setEstimatedTime(estimateListenTime(text, speed));
  }, [text, speed]);

  const playChunk = useCallback(
    (index: number) => {
      const chunks = chunksRef.current;
      if (index >= chunks.length) {
        setIsPlaying(false);
        setIsPaused(false);
        setCompletedChunks(chunks.length);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      if (hindiVoice) utterance.voice = hindiVoice;
      utterance.lang = "hi-IN";
      utterance.rate = 0.9 * speed;
      utterance.pitch = 1;

      utterance.onend = () => {
        const nextIndex = currentChunkRef.current + 1;
        currentChunkRef.current = nextIndex;
        setCompletedChunks(nextIndex);
        playChunk(nextIndex);
      };

      utterance.onerror = (event) => {
        if (event.error !== "interrupted" && event.error !== "canceled") {
          console.error("SpeechSynthesis error:", event.error);
        }
        setIsPlaying(false);
        setIsPaused(false);
      };

      currentChunkRef.current = index;
      window.speechSynthesis.speak(utterance);
    },
    [hindiVoice, speed]
  );

  const handlePlay = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.cancel();
      setIsPaused(false);
      setIsPlaying(true);
      playChunk(currentChunkRef.current);
      return;
    }

    const chunks = splitIntoChunks(text);
    chunksRef.current = chunks;
    currentChunkRef.current = 0;
    setTotalChunks(chunks.length);
    setCompletedChunks(0);

    window.speechSynthesis.cancel();
    setIsPlaying(true);
    setIsPaused(false);
    playChunk(0);
  }, [isPaused, text, playChunk]);

  const handlePause = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    currentChunkRef.current = 0;
    setCompletedChunks(0);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: Speed) => {
    setSpeed(newSpeed);
  }, []);

  const prevSpeedRef = useRef(speed);
  useEffect(() => {
    if (prevSpeedRef.current !== speed && isPlaying) {
      window.speechSynthesis.cancel();
      playChunk(currentChunkRef.current);
    }
    prevSpeedRef.current = speed;
  }, [speed, isPlaying, playChunk]);

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

  if (isSupported === null) {
    return null;
  }

  const progressPercent =
    totalChunks > 0 ? Math.round((completedChunks / totalChunks) * 100) : 0;

  return (
    <div
      className="bg-gradient-to-r from-tv10-metal to-gray-900 text-white p-4 rounded-xl shadow-lg border-l-4 border-tv10-gold mb-6"
      role="region"
      aria-label="AI News Reader audio player"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`bg-tv10-red p-3 rounded-full shadow-md ${isPlaying ? "animate-pulse" : ""}`}
          >
            <FaHeadphones className="text-lg" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              AI News Reader
            </p>
            <p className="text-sm md:text-base font-bold text-white">
              खबर सुनें (Listen Now)
              {estimatedTime > 0 && (
                <span className="ml-2 text-[10px] font-medium text-tv10-gold bg-white/10 px-2 py-0.5 rounded-full">
                  ~{estimatedTime} min
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="bg-white text-tv10-red h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg"
              aria-label={isPaused ? "Resume playback" : "Play news article"}
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

          {(isPlaying || isPaused) && (
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

      {(isPlaying || isPaused || completedChunks > 0) && totalChunks > 0 && (
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

      {(isPlaying || isPaused || completedChunks > 0) && (
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
