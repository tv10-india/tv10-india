"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-tv10-cream dark:bg-tv10-dark px-4 text-center">
      <h1 className="text-5xl font-black text-tv10-red mb-4">त्रुटि</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        कुछ गलत हो गया। कृपया दोबारा प्रयास करें।
      </p>
      <button
        onClick={reset}
        className="bg-tv10-red text-white font-bold px-6 py-3 rounded-full hover:bg-red-700 transition"
      >
        पुनः प्रयास करें
      </button>
    </main>
  );
}
